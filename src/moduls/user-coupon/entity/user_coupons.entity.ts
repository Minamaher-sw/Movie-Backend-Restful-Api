/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
  JoinColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../moduls/user/entities/user.entity';
import { CouponEntity } from '../../../moduls/coupon/entity/coupon.entity';

/** UserCoupons - tracks coupon redemptions by users */
@Entity({ name: 'user_coupons' })
export class UserCouponsEntity {
  @ApiProperty({ example: 'uuid-user', description: 'User UUID' })
  @PrimaryColumn({ type: 'uuid' })
  user_id: string;

  @ApiProperty({ example: 'uuid-coupon', description: 'Coupon UUID' })
  @PrimaryColumn({ type: 'uuid' })
  coupon_id: string;

  @ApiProperty({ example: '2025-11-02T20:00:00Z', description: 'When user redeemed this coupon' })
  @CreateDateColumn({ type: 'timestamp' })
  redeemed_at: Date;

  @ApiProperty({ example: true, description: 'Whether the coupon is still valid for user' })
  @Column({ type: 'boolean', default: true })
  is_valid: boolean;

  @ManyToOne(() => UserEntity, (user) => user.userCoupons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => CouponEntity, (coupon) => coupon.userCoupons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: CouponEntity;
}
