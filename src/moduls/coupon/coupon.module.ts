/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { CouponEntity } from './entity/coupon.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [CouponController],
  providers: [CouponService],
  imports:[TypeOrmModule.forFeature([CouponEntity]) ,JwtModule],
  exports: [CouponService],
})
export class CouponModule {}
