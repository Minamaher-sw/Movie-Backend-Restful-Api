/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionEntity } from './entity/subscription.entity';
import { LessThan, Repository } from 'typeorm';
import { SubscriptionPlanService } from '../subscription-plan/subscription-plan.service';
import { UserService } from '../user/user.service';
import { Transactional } from 'typeorm-transactional';
import { SubscriptionType } from '../../utils/enum';
import { Cron } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';
import { CouponService } from '../coupon/coupon.service';

@Injectable()
export class SubscriptionService {
    constructor(
        @InjectRepository(SubscriptionEntity) private readonly subscriptionRepository: Repository<SubscriptionEntity>,
        private readonly subPlanService: SubscriptionPlanService,
        private readonly userService: UserService,
        private readonly mailService: MailService,
        private readonly couponService: CouponService,
    ) { }

    /**
     * Creates a new pending subscription for a user.
     * @param userId - UUID of the user creating the subscription.
     * @param planId - UUID of the subscription plan to subscribe to.
     * @param couponCode - Optional coupon code to apply.
     * @returns Promise<SubscriptionEntity> Newly created subscription with `is_active = false`.
     * @throws NotFoundException if the user or plan is not found.
     * @throws BadRequestException if the coupon is invalid or user has active subscription.
     */
    async createPendingSubscription(
        userId: string,
        planId: string,
        couponCode?: string,
    ): Promise<SubscriptionEntity> {

        const user = await this.userService.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        const plan = await this.subPlanService.findById(planId);
        if (!plan) throw new NotFoundException('Subscription plan not found');

        // Check for existing subscription
        const existingSubscription = await this.subscriptionRepository.findOne({
            where: { user: { user_id: userId }, is_active: true },
        });
        if (existingSubscription) {
            throw new BadRequestException('User already has an active subscription');
        }

        let coupon: any = null;
        let finalPrice = plan.price;
        let discountAmount = 0
        if (couponCode) {
            coupon = await this.couponService.validateCoupon(couponCode);
            discountAmount = (coupon.discount_percent / 100) * plan.price;
            finalPrice = plan.price - discountAmount;
        }

        const newSubscription = this.subscriptionRepository.create({
            user,
            plan,
            coupon: coupon || null,
            discount_amount:discountAmount,
            final_price: finalPrice, // Store the final calculated price
        });

        return await this.subscriptionRepository.save(newSubscription);
    }

    /**
     * Activates a subscription after successful payment.
     * Calculates start and end dates based on the subscription plan duration.
     * Increments coupon use count if a coupon was applied.
     * @param subscriptionId - UUID of the subscription to activate.
     * @returns Promise<SubscriptionEntity> Activated subscription.
     * @throws NotFoundException if the subscription does not exist.
     * @throws BadRequestException if the subscription is already active.
     */
    @Transactional()
    async activateSubscription(subscriptionId: string): Promise<SubscriptionEntity> {
        const subscription = await this.getSubscriptionById(subscriptionId);

        if (subscription.is_active) {
            throw new BadRequestException('Subscription is already active');
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + subscription.plan.duration_days);

        subscription.is_active = true;
        subscription.start_date = startDate;
        subscription.end_date = endDate;

        if (subscription.coupon) {
            await this.couponService.incrementUseCount(subscription.coupon.code);
        }

        await this.userService.updateUserSubscriptionType(subscription.user.user_id, subscription.plan.name);

        return await this.subscriptionRepository.save(subscription);
    }

    /**
     * Cancels an active subscription and sets the user's subscription type to FREE.
     * @param subscriptionId - UUID of the subscription to cancel.
     * @returns Promise<SubscriptionEntity> Canceled subscription.
     * @throws NotFoundException if the subscription does not exist.
     */
    @Transactional()
    async cancelSubscription(subscriptionId: string): Promise<SubscriptionEntity> {
        const subscription = await this.getSubscriptionById(subscriptionId);

        subscription.is_active = false;
        subscription.user.subscriptionType = SubscriptionType.FREE;

        await this.userService.updateUserSubscriptionType(subscription.user.user_id, SubscriptionType.FREE);

        return await this.subscriptionRepository.save(subscription);
    }

    /**
     * Retrieves a subscription by its UUID.
     * Includes related user, plan, coupon, and payments.
     * @param subscriptionId - UUID of the subscription to retrieve.
     * @returns Promise<SubscriptionEntity> The subscription entity.
     * @throws NotFoundException if the subscription is not found.
     */
    async getSubscriptionById(subscriptionId: string): Promise<SubscriptionEntity> {
        const subscription = await this.subscriptionRepository.findOne({
            where: { subscription_id: subscriptionId },
            relations: ['plan', 'user', 'coupon', 'payments'],
        });
        if (!subscription) throw new NotFoundException('Subscription not found');
        return subscription;
    }

    /**
     * Retrieves all subscriptions of a specific user with pagination and optional filter by active status.
     * @param userId - UUID of the user.
     * @param options - Pagination and filter options.
     * @param options.page - Page number (default: "1").
     * @param options.limit - Number of subscriptions per page (default: "10").
     * @param options.is_active - Optional filter for active subscriptions.
     * @returns Promise<SubscriptionEntity[]> List of subscriptions matching the criteria.
     */
    async getUserSubscriptions(
        userId: string,
        { page = '1', limit = '10', is_active }: { page?: string; limit?: string; is_active?: boolean },
    ): Promise<SubscriptionEntity[]> {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        return await this.subscriptionRepository.find({
            where: { user: { user_id: userId }, ...(is_active !== undefined ? { is_active } : {}) },
            relations: ['plan', 'coupon', 'payments'],
            order: { start_date: 'DESC' },
            skip,
            take,
        });
    }

    /**
     * Retrieves all subscriptions with optional filters, sorting, and pagination.
     * Supports filtering by active status, start and end dates.
     * @param query - Object containing filter, pagination, and sorting options.
     * @param query.page - Page number (default: 1).
     * @param query.limit - Number of subscriptions per page (default: 10).
     * @param query.sortBy - Field to sort by (default: 'created_at').
     * @param query.sortOrder - Sort order: 'ASC' or 'DESC' (default: 'DESC').
     * @param query.is_active - Optional filter by active status.
     * @param query.start_date - Optional filter by subscriptions starting after this date.
     * @param query.end_date - Optional filter by subscriptions ending before this date.
     * @returns Promise<{ subscriptions: SubscriptionEntity[]; total: number }>
     *   Object containing filtered subscriptions and total count.
     */
    async getAllSubscriptions(query: any): Promise<{ subscriptions: SubscriptionEntity[]; total: number }> {
        const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC', is_active, start_date, end_date } = query;

        const subQB = this.subscriptionRepository.createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.user', 'user')
            .leftJoinAndSelect('subscription.plan', 'plan')
            .leftJoinAndSelect('subscription.coupon', 'coupon')
            .leftJoinAndSelect('subscription.payments', 'payments');

        if (is_active !== undefined) {
            subQB.andWhere('subscription.is_active = :is_active', { is_active: is_active === 'true' });
        }

        if (start_date) {
            subQB.andWhere('subscription.start_date >= :start_date', { start_date: new Date(start_date) });
        }

        if (end_date) {
            subQB.andWhere('subscription.end_date <= :end_date', { end_date: new Date(end_date) });
        }

        subQB.orderBy(`subscription.${sortBy}`, sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC')
            .skip((parseInt(page) - 1) * parseInt(limit))
            .take(parseInt(limit));

        const [subscriptions, total] = await subQB.getManyAndCount();

        return { subscriptions, total };
    }

    async getActiveSubscriptions(query: any): Promise<{ subscriptions: SubscriptionEntity[]; total: number }> {
        const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC', start_date, end_date } = query;

        const subQB = this.subscriptionRepository.createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.user', 'user')
            .leftJoinAndSelect('subscription.plan', 'plan')
            .leftJoinAndSelect('subscription.coupon', 'coupon')
            .leftJoinAndSelect('subscription.payments', 'payments');

        subQB.andWhere('subscription.is_active = :is_active', { is_active: true });

        if (start_date) {
            subQB.andWhere('subscription.start_date >= :start_date', { start_date: new Date(start_date) });
        }

        if (end_date) {
            subQB.andWhere('subscription.end_date <= :end_date', { end_date: new Date(end_date) });
        }

        subQB.orderBy(`subscription.${sortBy}`, sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC')
            .skip((parseInt(page) - 1) * parseInt(limit))
            .take(parseInt(limit));

        const [subscriptions, total] = await subQB.getManyAndCount();

        return { subscriptions, total };
    }
    /**
     * Deactivates subscriptions that have expired.
     * Scheduled to run daily at midnight.
     */
    @Cron('0 0 * * *')
    async handleExpiredSubscriptions(): Promise<void> {
        const today = new Date();

        const expiredSubscriptions = await this.subscriptionRepository.find({
            where: {
                is_active: true,
                end_date: LessThan(today)
            },
            relations: ['user']
        });

        for (const subscription of expiredSubscriptions) {
            subscription.is_active = false;
            subscription.user.subscriptionType = SubscriptionType.FREE;
            await this.userService.updateUserSubscriptionType(subscription.user.user_id, SubscriptionType.FREE);
            await this.subscriptionRepository.save(subscription);
        }
    }

    /**
     * Sends email notifications to users whose subscriptions are expiring in 3 days.
     * Scheduled to run daily at 9 AM.
     */
    @Cron('0 9 * * *')
    async notifyExpiringSubscriptions(): Promise<void> {
        const today = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);
        const expiringSubscriptions = await this.subscriptionRepository.find({
            where: {
                is_active: true,
                end_date: threeDaysLater
            },
            relations: ['user']
        });

        for (const subscription of expiringSubscriptions) {
            await this.mailService.sendReminderSubscriptionEmail(
                subscription.user.email,
                subscription.user.firstName,
                Math.ceil((subscription.end_date!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            );
        }
    }

    /**
     * Updates a subscription to a new plan and adjusts the end date accordingly.
     * @param {string} subscriptionId - The ID of the subscription to update.
     * @param {string} newPlanId - The ID of the new subscription plan.
     * @throws {NotFoundException} If subscription or new plan is not found.
     * @returns {Promise<SubscriptionEntity>} The updated subscription.
     */
    @Transactional()
    async updateSubscriptionPlan(subscriptionId: string, newPlanId: string): Promise<SubscriptionEntity> {
        const subscription = await this.subscriptionRepository.findOne({
            where: { subscription_id: subscriptionId },
            relations: ['user', 'plan'],
        });
        if (!subscription) throw new NotFoundException('Subscription not found');

        const newPlan = await this.subPlanService.findById(newPlanId);
        if (!newPlan) throw new NotFoundException('New plan not found');

        subscription.plan = newPlan;

        if (subscription.start_date) {
            const startDate = new Date(subscription.start_date);
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + newPlan.duration_days);
            subscription.end_date = endDate;
        }

        await this.userService.updateUserSubscriptionType(subscription.user.user_id, newPlan.name);
        return await this.subscriptionRepository.save(subscription);
    }

    // update subscription details (e.g., coupon)
}
