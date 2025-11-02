/* eslint-disable prettier/prettier */
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { SubscriptionType, UserRole } from 'src/utils/enum';
import { RatingEntity } from 'src/rating/entity/rating.entity';
import { PaymentEntity } from 'src/payment/entity/payment.entity';
import { SubscriptionEntity } from 'src/subscription/entity/subscription.entity';
import { CouponEntity } from 'src/coupon/entity/coupon.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @ApiProperty({
    example: 'd6a9b3e1-9f94-4b65-8c02-d34ad6a2f2c9',
    description: 'Unique identifier for the user (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  user_id: number;

  @ApiProperty({
    example: 'Mina',
    description: 'First name of the user',
  })
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @ApiProperty({
    example: 'Maher',
    description: 'Last name of the user',
  })
  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @ApiProperty({
    example: '+201112345678',
    description: 'Phone number in international format (E.164)',
    required: false,
  })
  @Column({ type: 'varchar', length: 15, nullable: true })
  phone?: string;

  @ApiProperty({
    example: 'mina@example.com',
    description: 'Unique email address of the user',
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'Hashed user password',
  })
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ApiProperty({
    example: 'https://i.imgur.com/avatar.png',
    description: 'Profile avatar image URL',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  @ApiProperty({
    enum: SubscriptionType,
    example: SubscriptionType.FREE,
    description: 'Type of subscription the user currently holds',
  })
  @Column({
    type: 'enum',
    enum: SubscriptionType,
    default: SubscriptionType.FREE,
  })
  subscriptionType: SubscriptionType;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'Role of the user in the system (USER or ADMIN)',
  })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ApiProperty({
    example: false,
    description: 'Indicates whether the user has verified their account',
  })
  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @ApiProperty({
    example: '2025-10-30T10:25:00.000Z',
    description: 'Timestamp when the user record was created',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-10-31T10:25:00.000Z',
    description: 'Timestamp when the user record was last updated',
  })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  @ApiProperty({ example: null, description: 'Soft delete timestamp (if deleted)' })
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @ApiProperty({ example: 'User associated with the rating', description: 'User associated with the rating' })
  @OneToMany(() => RatingEntity, (rating) => rating.user)
  ratings: RatingEntity[];

  @ApiProperty({ example: 'User associated with the payment', description: 'User associated with the payment' })
  @OneToMany(() => PaymentEntity, (payment) => payment.user)
  payments: PaymentEntity[]

  @ApiProperty({ example: 'User associated with the subscription', description: 'User associated with the subscription' })
  @OneToMany(() => SubscriptionEntity, (subscription) => subscription.user)
  subscriptions: SubscriptionEntity[]

  @ApiProperty({ example: 'User associated with the coupon', description: 'User associated with the coupon' })
  @ManyToMany(() => CouponEntity, (coupons) => coupons.users)
  @JoinTable({ name: 'user_coupons' })
  coupons: CouponEntity[];
}
