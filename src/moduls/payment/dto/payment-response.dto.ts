/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../../../utils/enum';
import { UserEntity } from '../../../moduls/user/entities/user.entity';
import { SubscriptionEntity } from '../../../moduls/subscription/entity/subscription.entity';

/**
 * DTO for returning payment details in API responses.
 */
export class PaymentResponseDto {
  @ApiProperty({
    example: 'p1a2b3c4-....',
    description: 'Payment UUID (primary key)',
  })
  payment_id: string;

  @ApiProperty({ example: 9.99, description: 'Payment amount in USD' })
  amount: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
    description: 'Payment method used',
  })
  method: PaymentMethod;

  @ApiProperty({
    enum: PaymentStatus,
    example: PaymentStatus.SUCCESS,
    description: 'Status of the payment transaction',
  })
  status: PaymentStatus;

  @ApiProperty({
    example: 'txn_123456',
    description: 'Payment gateway transaction identifier',
    required: false,
  })
  transaction_id?: string;

  @ApiProperty({
    example: 'monthly',
    description: 'Billing cycle for this payment (e.g. monthly, yearly)',
    required: false,
  })
  billing_cycle?: string;

  @ApiProperty({
    example: '2025-10-02T00:00:00Z',
    description: 'Date and time when the payment was created',
  })
  payment_date: Date;

  @ApiProperty({
    type: () => UserEntity,
    description: 'User who made this payment',
  })
  user: UserEntity;

  @ApiProperty({
    type: () => SubscriptionEntity,
    description: 'Subscription associated with this payment (if any)',
    required: false,
  })
  subscription?: SubscriptionEntity;
}
