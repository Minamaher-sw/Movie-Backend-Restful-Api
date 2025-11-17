/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserCouponService } from './user-coupon.service';
import { UserCouponsEntity } from './entity/user_coupons.entity';
import { CreateUserCouponDto } from './dto/create-user-cupon.dto';
import { UserRole } from '../../utils/enum';

import type { JwtPayloadType } from '../../utils/types';
import { UpdateUserCouponDto } from './dto/update-user-cupon.dto';
import { Role } from '../../common/decrators/user-role/user-role.decorator';
import { AuthRoleGuard } from '../../common/guards/role_guard/auth.role.guard';
import { CurrentUser } from '../../common/decrators/currentuser/currentuser.decorator';

@Controller('api/v1/usercoupon')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UserCouponController {
    constructor(private readonly userCouponService: UserCouponService) {}

    // use coupon endpoint
    @Post()
    @Role(UserRole.USER)
    @UseGuards(AuthRoleGuard)
    async useCoupon(@CurrentUser() payload :JwtPayloadType ,@Body() useCouponDto: CreateUserCouponDto): Promise<UserCouponsEntity> {
        const { coupon_code } = useCouponDto;
        return this.userCouponService.useCoupon(payload.userId, coupon_code);
    }

    // find all  user coupons endpoint
    @Get('user/coupons')
    @Role(UserRole.USER)
    @UseGuards(AuthRoleGuard)
    async findAllUsedCoupons(@CurrentUser() payload: JwtPayloadType): Promise<UserCouponsEntity[]> {
        return this.userCouponService.findAllCouponsUsedByUser(payload);
    }

    // find all admin coupons endpoint
    @Get('admin/user/coupons')
    @Role(UserRole.ADMIN)
    @UseGuards(AuthRoleGuard)
    async findAllUsedCouponsByAdmin(@Query() query:any): Promise<UserCouponsEntity[]> {
        return this.userCouponService.findAll(query);
    }

    // update validity endpoint can be added here in future
    @Post('admin/user/:userId/coupons/:couponId/validity')
    @Role(UserRole.ADMIN)
    @UseGuards(AuthRoleGuard)
    async updateCouponValidity(@Body() updateCouponDto: UpdateUserCouponDto ,@Param('userId') userId: string, @Param('couponId') couponId: string): Promise<string> {
        // Implementation for updating coupon validity can be added here
        const { is_valid } = updateCouponDto;
        if(is_valid === undefined) {
            throw new Error('is_valid field is required');
        }
        await this.userCouponService.updateValidity(userId, couponId, is_valid);
        return 'Coupon validity updated successfully';
    }

}
