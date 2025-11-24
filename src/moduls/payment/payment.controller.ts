/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
    UsePipes,
    ValidationPipe,
    Param,
    HttpCode
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import type { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import Stripe from 'stripe';
import { MailService } from '../mail/mail.service';
import { StripeService } from './stripe/stripe.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Role } from 'src/common/decrators/user-role/user-role.decorator';
import { UserRole } from 'src/utils/enum';
import { AuthRoleGuard } from 'src/common/guards/role_guard/auth.role.guard';
import { CurrentUser } from 'src/common/decrators/currentuser/currentuser.decorator';
import { type JwtPayloadType } from 'src/utils/types';

@ApiTags('Payment')
@Controller('payment')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService,
        private readonly mailService: MailService,
        private readonly stripeService: StripeService,
    ) {}

    @Post()
    @Role(UserRole.USER)
    @UseGuards(AuthRoleGuard)
    @ApiOperation({ summary: 'Create a new payment for a subscription' })
    @ApiResponse({ status: 201, description: 'Payment created successfully' })
    async createPayment(
        @Body() dto: CreatePaymentDto,
        @CurrentUser() payload: JwtPayloadType,
    ) {
        const payment = await this.paymentService.createPayment(dto, payload.userId);
        return {
            success: true,
            message: 'Payment created successfully',
            data: payment,
        };
    }

    @Post('delete/:id')
    @Role(UserRole.ADMIN)
    @UseGuards(AuthRoleGuard)
    @ApiOperation({ summary: 'Delete a payment by ID (Admin only)' })
    async deletePayment(@Param('id') paymentId: string) {
        await this.paymentService.deletePayment(paymentId);
        return { success: true, message: 'Payment deleted successfully' };
    }

    @Get('all')
    @Role(UserRole.ADMIN)
    @UseGuards(AuthRoleGuard)
    @ApiOperation({ summary: 'Retrieve all payments' })
    async getAllPayments(@Query() query: any) {
        const payments = await this.paymentService.getAllPayments(query);
        return {
            success: true,
            message: 'Payments retrieved successfully',
            data: payments,
        };
    }

    @Get('single/:id')
    @Role(UserRole.ADMIN, UserRole.USER)
    @UseGuards(AuthRoleGuard)
    @ApiOperation({ summary: 'Retrieve a single payment by ID' })
    async getPaymentById(@Param('id') paymentId: string) {
        const payment = await this.paymentService.getPaymentById(paymentId);
        return {
            success: true,
            message: 'Payment retrieved successfully',
            data: payment,
        };
    }

    /**
     * Stripe Webhook Handler
     * Must use RAW BODY, handled in main.ts
     */
    @Post('webhook')
    @HttpCode(200) // Force 200 to avoid retry storms
    @ApiOperation({ summary: 'Stripe webhook endpoint' })
    async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
        console.log('🔥 Webhook received — Headers:', req.headers);

        const sig = req.headers['stripe-signature'] as string;

        let event: Stripe.Event;

        try {
            console.log('🔍 Verifying signature...');
            event = this.stripeService.verifyWebhook(req.body as Buffer, sig);
            console.log(`✅ Webhook verified — Event: ${event.type}`);
        } catch (err) {
            console.error('❌ Signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            console.log('⚙ Processing event…');
            await this.paymentService.handleStripeWebhook(event);
            console.log(`✔ Event ${event.type} processed`);
        } catch (err) {
            console.error('❌ Error while handling webhook:', err);
            return res.status(500).send('Internal Server Error');
        }

        // If payment succeeded → send email
        if (
            event.type === 'payment_intent.succeeded' ||
            event.type === 'checkout.session.completed'
        ) {
            const obj = event.data.object as any;
            const email = obj.customer_email;

            if (email) {
                console.log(`📧 Sending receipt email → ${email}`);
                try {
                    await this.mailService.sendPaymentReceiptEmail(
                        email,
                        obj.id,
                        (obj.amount / 100).toFixed(2),
                    );
                    console.log('📨 Email sent.');
                } catch (err) {
                    console.error('❌ Failed to send email:', err);
                }
            } else {
                console.log('⚠ No email found — skipping receipt');
            }
        }

        return res.send({ received: true });
    }
}
