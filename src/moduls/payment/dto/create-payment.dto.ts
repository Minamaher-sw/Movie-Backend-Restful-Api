/* eslint-disable prettier/prettier */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNumber,
    IsEnum,
    IsOptional,
    IsString,
    Min,
    Length,
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../../../utils/enum';

/**
 * DTO for creating a new payment record.
 */
export class CreatePaymentDto {
    @ApiProperty({ example: 9.99, description: 'Payment amount in USD' })
    @IsNumber({}, { message: 'amount must be a number' })
    @Min(0.01, { message: 'amount must be greater than zero' })
    amount: number;

    @ApiProperty({
        enum: PaymentMethod,
        example: PaymentMethod.CARD,
        description: 'Payment method used for the transaction',
    })
    @IsEnum(PaymentMethod, {
        message: `method must be one of: ${Object.values(PaymentMethod).join(', ')}`,
    })
    method: PaymentMethod;

    @ApiPropertyOptional({
        enum: PaymentStatus,
        example: PaymentStatus.PENDING,
        description: 'Current payment status (default: PENDING)',
    })
    @IsOptional()
    @IsEnum(PaymentStatus, {
        message: `status must be one of: ${Object.values(PaymentStatus).join(', ')}`,
    })
    status?: PaymentStatus;

    @ApiPropertyOptional({
        example: 'txn_123456',
        description: 'Payment gateway transaction ID (optional)',
    })
    @IsOptional()
    @IsString({ message: 'transaction_id must be a string' })
    @Length(1, 255, {
        message: 'transaction_id must be between 1 and 255 characters',
    })
    transaction_id?: string;

    @ApiPropertyOptional({
        example: 'monthly',
        description: 'Billing cycle (e.g. monthly, yearly)',
    })
    @IsOptional()
    @IsString({ message: 'billing_cycle must be a string' })
    @Length(1, 50, {
        message: 'billing_cycle must be between 1 and 50 characters',
    })
    billing_cycle?: string;

}