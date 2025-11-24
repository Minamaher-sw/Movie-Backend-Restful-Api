/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity } from './entity/payment.entity';
import { Repository } from 'typeorm';
import { StripeService } from './stripe/stripe.service';
import { UserService } from '../user/user.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionEntity } from '../subscription/entity/subscription.entity';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Transactional } from 'typeorm-transactional';
import { PaymentMethod, PaymentStatus } from '../../utils/enum';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(PaymentEntity)
        private paymentRepository: Repository<PaymentEntity>,
        private readonly stripeService: StripeService,
        private readonly config: ConfigService,
        private readonly userService: UserService,
        private readonly subscriptionService: SubscriptionService,
    ) { }

    /**
     * Create payment for a subscription and initiate Stripe checkout
     */
    @Transactional()
    async createPayment(dto: CreatePaymentDto, userId: string) {
        // get subscription
        const subscription = await this.subscriptionService.getSubscriptionById(
            dto.subscriptionId,
        );

        if (!subscription) throw new NotFoundException('Subscription not found');

        if (subscription.user.user_id !== userId)
            throw new ForbiddenException(
                'You cannot pay for another user subscription',
            );

        // Check if already paid
        const existing = await this.paymentRepository.findOne({
            where: { subscription: { subscription_id: dto.subscriptionId } },
        });

        if (existing)
            throw new BadRequestException('Payment already exists for this subscription');

        // Create Checkout Session
        let stripeSession: any = null;
        if (dto.method === PaymentMethod.CARD) {
            stripeSession = await this.createStripeCheckoutSession(subscription);
        }

        console.log("🔥 Stripe session created:", stripeSession?.id);
        console.log("🔥 Stripe payment_intent:", stripeSession?.payment_intent);

        // Create Payment record using **payment_intent**
        const payment = this.paymentRepository.create({
            amount: subscription.final_price,
            method: dto.method,
            // important change here:
            transaction_id: stripeSession?.payment_intent || null,
            checkout_session_id: stripeSession?.id || null,
            status: PaymentStatus.PENDING,
            user: subscription.user,
            subscription,
            billing_cycle: this.determineBillingCycle(subscription.plan.duration_days),
            payment_date: new Date(),
        });

        await this.paymentRepository.save(payment);

        return {
            payment,
            sessionUrl: stripeSession?.url || null,
            sessionId: stripeSession?.id || null,
        };
    }

    /**
     * Handle Incoming Stripe Webhook Events
     */
    async handleStripeWebhook(event: any) {
        try {
            console.log("⚡ Webhook Event Received:", event.type);

            switch (event.type) {
                case 'checkout.session.completed':
                    console.log("⚡ Handling checkout.session.completed");
                    await this.handlePaymentSuccess(event.data.object);
                    break;

                case 'payment_intent.succeeded':
                    console.log("⚡ Handling payment_intent.succeeded");
                    await this.handlePaymentIntentSucceeded(event.data.object);
                    break;

                case 'payment_intent.payment_failed':
                    console.log("⚡ Handling payment_intent.payment_failed");
                    await this.handlePaymentFailed(event.data.object);
                    break;

                case 'checkout.session.expired':
                    console.log("⚡ Handling checkout.session.expired");
                    await this.handlePaymentExpired(event.data.object);
                    break;

                case 'charge.refunded':
                    console.log("⚡ Handling charge.refunded");
                    await this.handleRefund(event.data.object);
                    break;

                default:
                    console.log(`⚠ Unhandled event type: ${event.type}`);
            }
        } catch (error) {
            console.error('🔥 Webhook handling error:', error);
            throw error;
        }
    }

    // ---------------------------------------------
    // HANDLERS
    // ---------------------------------------------

    /**
     * Checkout Session Completed
     */
    @Transactional()
    private async handlePaymentSuccess(session: any) {
        console.log("⚡ Handling checkout.session.completed");

        const payment = await this.paymentRepository.findOne({
            where: { checkout_session_id: session.id },
            relations: ['subscription', 'user'],
        });

        if (!payment) {
            console.log(`❌ Payment not found for session: ${session.id}`);
            throw new NotFoundException('Payment record not found for successful session');
        }

        // الآن نربط الـ intent الحقيقي
        if (session.payment_intent) {
            console.log("🔥 Updating payment_intent:", session.payment_intent);
            payment.transaction_id = session.payment_intent;
        }

        payment.status = PaymentStatus.SUCCESS;

        await this.paymentRepository.save(payment);

        await this.subscriptionService.activateSubscription(payment.subscription!.subscription_id);

        console.log("✔ Payment session updated and subscription activated");
    }


    /**
     * PaymentIntent Success
     */
    @Transactional()
    private async handlePaymentIntentSucceeded(intent: any) {
        console.log("⚡ Handling payment_intent.succeeded");
        console.log("🔥 PaymentIntent Success:", intent.id);

        const payment = await this.paymentRepository.findOne({
            where: { transaction_id: intent.id },
            relations: ['subscription', 'user'],
        });

        // لا ترمي خطأ
        if (!payment) {
            console.log(`⚠ Payment not found for intent ${intent.id}. Probably handled by checkout.session.completed`);
            return; // ببساطة تجاهله
        }

        payment.status = PaymentStatus.SUCCESS;
        await this.paymentRepository.save(payment);

        await this.subscriptionService.activateSubscription(payment.subscription!.subscription_id);

        console.log("✔ Payment intent updated and subscription activated");
    }

    /**
     * Payment Failed
     */
    private async handlePaymentFailed(intent: any) {
        try {
            console.log("🔥 PaymentIntent FAILED:", intent.id);

            const payment = await this.paymentRepository.findOne({
                where: { transaction_id: intent.id },
                relations: ['subscription', 'user'],
            });

            if (!payment) {
                throw new NotFoundException(
                    'Payment record not found for failed intent',
                );
            }

            payment.status = PaymentStatus.FAILED;
            await this.paymentRepository.save(payment);

            console.log("❌ Payment marked FAILED");
        } catch (error) {
            console.error(' Error in handlePaymentFailed:', error);
            throw new Error('Failed to process payment failure');
        }
    }

    /**
     * Checkout Session Expired
     */
    private async handlePaymentExpired(session: any) {
        try {
            console.log("🔥 Session Expired:", session.id);

            const payment = await this.paymentRepository.findOne({
                where: { checkout_session_id: session.id },
                relations: ['subscription', 'user'],
            });

            if (!payment) {
                throw new NotFoundException(
                    'Payment record not found for expired session',
                );
            }

            payment.status = PaymentStatus.EXPIRED;
            await this.paymentRepository.save(payment);

            console.log("❌ Payment marked EXPIRED");
        } catch (error) {
            console.error(' Error in handlePaymentExpired:', error);
            throw new Error('Failed to process payment expiration');
        }
    }

    /**
     * Refund Handler
     */
    private async handleRefund(charge: any) {
        try {
            console.log("🔥 Refund Event:", charge.payment_intent);

            const payment = await this.paymentRepository.findOne({
                where: { transaction_id: charge.payment_intent },
                relations: ['subscription', 'user'],
            });

            if (!payment) {
                throw new NotFoundException(
                    'Payment record not found for refund charge',
                );
            }

            payment.status = PaymentStatus.REFUNDED;
            await this.paymentRepository.save(payment);

            console.log("💰 Payment marked REFUNDED");
        } catch (error) {
            console.error(' Error in handleRefund:', error);
            throw new Error('Failed to process payment refund');
        }
    }

    // ---------------------------------------------
    // UTILITIES
    // ---------------------------------------------

    private determineBillingCycle(days: number): string {
        if (days === 30) return 'monthly';
        if (days === 365) return 'yearly';
        if (days === 7) return 'weekly';
        if (days === 90) return 'quarterly';
        return `${days}_days`;
    }

    /**
     * Create Stripe Checkout Session
     */
    private async createStripeCheckoutSession(subscription: SubscriptionEntity) {
        const stripe = this.stripeService.getInstance();

        try {
            if (!subscription || !subscription.plan) {
                throw new Error('Subscription must contain valid plan data');
            }

            const lineItems = [
                {
                    price_data: {
                        currency: subscription.plan.currency || 'USD',
                        product_data: {
                            name: subscription.plan.name,
                            description: subscription.plan.description,
                        },
                        unit_amount: Math.round(subscription.final_price * 100),
                    },
                    quantity: 1,
                },
            ];

            return await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: lineItems,
                success_url: `${this.config.get('CLIENT_URL')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${this.config.get('CLIENT_URL')}/payment-cancel`,
                metadata: {
                    subscription_id: subscription.subscription_id,
                    user_id: subscription.user.user_id,
                },
                customer_email: subscription.user.email,
            });
        } catch (err) {
            throw new Error(`Stripe error: ${err.message}`);
        }
    }

    // ---------------------------------------------
    // GETTERS
    // ---------------------------------------------

    async getPaymentById(paymentId: string): Promise<PaymentResponseDto> {
        const payment = await this.getPayment(paymentId);
        return payment;
    }

    async getAllPayments(query: any): Promise<{
        payments: PaymentResponseDto[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }> {
        const queryBuilder = this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.user', 'user')
            .leftJoinAndSelect('payment.subscription', 'subscription');

        if (query.status) {
            queryBuilder.andWhere('payment.status = :status', {
                status: query.status,
            });
        }
        if (query.method) {
            queryBuilder.andWhere('payment.method = :method', {
                method: query.method,
            });
        }

        const sortBy = query.sortBy || 'payment.payment_date';
        const order: 'ASC' | 'DESC' =
            (query.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        queryBuilder.orderBy(sortBy, order);

        const page =
            parseInt(query.page, 10) > 0 ? parseInt(query.page, 10) : 1;
        const limit =
            parseInt(query.limit, 10) > 0 ? parseInt(query.limit, 10) : 10;

        queryBuilder.skip((page - 1) * limit).take(limit);

        const [payments, total] = await queryBuilder.getManyAndCount();

        if (payments.length === 0) {
            throw new NotFoundException('No payments found');
        }

        return {
            payments,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }

    async deletePayment(paymentId: string): Promise<void> {
        const payment = await this.getPayment(paymentId);
        await this.paymentRepository.remove(payment);
    }

    private async getPayment(paymentId: string): Promise<PaymentEntity> {
        const payment = await this.paymentRepository.findOne({
            where: { payment_id: paymentId },
            relations: ['user', 'subscription'],
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }
}
