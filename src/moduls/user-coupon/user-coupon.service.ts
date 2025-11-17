/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCouponsEntity } from './entity/user_coupons.entity';
import { Repository } from 'typeorm';

import { JwtPayloadType } from '../../utils/types';
import { CouponService } from '../coupon/coupon.service';
import { UserService } from '../user/user.service';

@Injectable()
export class UserCouponService {
  constructor(
    @InjectRepository(UserCouponsEntity) private userCouponsRepository: Repository<UserCouponsEntity>,
    private readonly couponService: CouponService,
    private readonly userService: UserService
  ) { }

  // use coupon method
  /** Use a coupon for a user (redeem it once) */
  public async useCoupon(userId: string, couponCode: string): Promise<UserCouponsEntity> {
    // 1. Find coupon by code
    const coupon = await this.couponService.findCouponByCode(couponCode);
    if (!coupon) throw new NotFoundException('Coupon not found');

    // 2. Find user
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // 3. Check coupon expiry
    const now = new Date();
    const validTo = new Date(coupon.valid_to);
    const is_valid = validTo >= now;

    if (!is_valid) throw new BadRequestException('Coupon has expired');
    // 4. Check if user already used this coupon
    const existing = await this.userCouponsRepository.findOne({
      where: { user_id: userId, coupon_id: coupon.coupon_id },
    });
    if (existing) throw new ConflictException('Coupon has already been used by this user');

    // 5. Create relation record
    const userCoupon = this.userCouponsRepository.create({
      is_valid,
      user,
      coupon
    });

    return await this.userCouponsRepository.save(userCoupon);
  }

  public async findAllCouponsUsedByUser(payload: JwtPayloadType): Promise<UserCouponsEntity[]> {

    if (!payload?.userId) throw new BadRequestException('Invalid user payload');

    if (payload?.role !== 'USER' && payload?.role !== 'ADMIN') {
      throw new BadRequestException('Insufficient user role');
    }
    return await this.userCouponsRepository.find({
      where: { user_id: payload.userId },
      relations: ['user', 'coupon'],
    });
  }

  /** Update validity (e.g., invalidate coupon) */
  async updateValidity(user_id: string, coupon_id: string, is_valid: boolean): Promise<UserCouponsEntity> {
    const record = await this.userCouponsRepository.findOne({ where: { user_id, coupon_id } });
    if (!record) throw new NotFoundException('User coupon not found');
    record.is_valid = is_valid;
    return await this.userCouponsRepository.save(record);
  }

  /** Delete link (user loses coupon) */
  async remove(user_id: string, coupon_id: string): Promise<void> {
    const result = await this.userCouponsRepository.delete({ user_id, coupon_id });
    if (result.affected === 0) throw new NotFoundException('User coupon not found');
  }

  // find all used coupons
  public async findAll(query: any): Promise<UserCouponsEntity[]> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;
    return await this.userCouponsRepository.find({
      relations: ['user', 'coupon'],
      skip,
      take: limit,
    });
  }
}
