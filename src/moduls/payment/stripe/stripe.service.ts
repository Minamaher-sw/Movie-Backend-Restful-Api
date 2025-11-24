/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import config from '../../../config/payment/payment.config';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor() {
        const stripeConfig = config().stripe;
        this.stripe = new Stripe(stripeConfig.secretKey || '', { apiVersion: '2025-11-17.clover' });
    }

    /**
     * Create a payment intent for a given amount.
     * @param amount - Amount in cents
     * @param currency - Currency code (default from config)
     */
    async createPaymentIntent(amount: number, currency?: string, metadata?: Record<string, any>) {
        return await this.stripe.paymentIntents.create({
            amount,
            currency: currency || config().stripe.currency,
            metadata,
        });
    }

    /**
     * Verify webhook signature and return event
     * @param payload - Raw body
     * @param signature - Stripe signature header
     */
    verifyWebhook(payload: Buffer, signature: string): Stripe.Event {
        return this.stripe.webhooks.constructEvent(payload, signature, config().stripe.webhookSecret || '');
    }

    getInstance(): Stripe {
        return this.stripe;
    }
}
