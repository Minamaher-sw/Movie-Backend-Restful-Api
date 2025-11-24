/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SubscriptionPlanController } from './subscription-plan.controller';
import { SubscriptionPlanService } from './subscription-plan.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlanEntity } from './entity/subscription-plan.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [SubscriptionPlanController],
  providers: [SubscriptionPlanService],
  imports:[TypeOrmModule.forFeature([SubscriptionPlanEntity]) ,ConfigModule , JwtModule],
  exports: [SubscriptionPlanService],

})
export class SubscriptionPlanModule {}
