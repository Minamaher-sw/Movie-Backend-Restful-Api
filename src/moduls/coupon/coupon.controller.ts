/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CouponService } from './coupon.service';

import { CreateCouponDto } from './dto/create.coupon.dot';
import { CouponEntity } from './entity/coupon.entity';
import { ApiParam, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { UpdateCouponDto } from './dto/update.coupon.dto';
import { isValidUUID } from '../../utils/check_id_uuid';
import { UserRole } from '../../utils/enum';
import { AuthRoleGuard } from '../../common/guards/role_guard/auth.role.guard';
import { Role } from '../../common/decrators/user-role/user-role.decorator';

@Controller('api/v1/coupon')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(AuthRoleGuard)
export class CouponController {
    constructor(private readonly couponService: CouponService) { }

    // Define your endpoints here
    /**
     * Creates a new coupon
     * @param createCouponDto   Data for creating the coupon 
     * @returns The created coupon entity wrapped in a response object
     */
    @ApiProperty({ example: 'Creates a new coupon', description: 'Endpoint to create a new coupon' })
    @ApiParam({ name: 'createCouponDto', type: CreateCouponDto })
    @ApiResponse({ status: 201, description: 'Coupon created successfully.' })
    @Role(UserRole.ADMIN)
    @Post()
    async createCoupon(@Body() createCouponDto: CreateCouponDto): Promise<{ success: boolean; message: string; data: CouponEntity }> {
        const newCoupon = await this.couponService.createCoupon(createCouponDto);
        return {
            success: true,
            message: 'Coupon created successfully',
            data: newCoupon,
        };
    }

    @ApiProperty({ example: 'Retrieves all coupons', description: 'Endpoint to retrieve all coupons' })
    @ApiParam({ name: 'query', type: Object })
    @ApiResponse({ status: 200, description: 'Coupons retrieved successfully.' })
    @Role(UserRole.ADMIN)
    @Get()
    async getAllCoupons(@Query() query): Promise<{ success: boolean; message: string; data: any }> {
        const coupons = await this.couponService.findAllCoupons(query);
        return {
            success: true,
            message: 'Coupons retrieved successfully',
            data: coupons,
        };
    }

    // Define your endpoints here
    /**
     * Retrieves a coupon by its ID
     * @param id The ID of the coupon to retrieve
     * @returns The retrieved coupon entity wrapped in a response object
     */
    @ApiProperty({ example: 'Retrieves a coupon by ID', description: 'Endpoint to retrieve a coupon by its ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'UUID of the coupon' })
    @ApiResponse({ status: 200, description: 'Coupon retrieved successfully.' })
    @Role(UserRole.ADMIN)
    @Get(':id')
    async getCouponById(@Param('id') id: string): Promise<{ success: boolean; message: string; data: CouponEntity }> {
        if(!isValidUUID(id)){
            throw new NotFoundException('Coupon id not valid');
        }
        const coupon = await this.couponService.findCouponById(id);
        return {
            success: true,
            message: 'Coupon retrieved successfully',
            data: coupon,
        };
    }

    /** 
     * Updates an existing coupon
     * @param id The ID of the coupon to update
     * @param updateCouponDto Data for updating the coupon
    */
    @ApiProperty({ example: 'Updates an existing coupon', description: 'Endpoint to update an existing coupon' })
    @ApiParam({ name: 'id', type: 'string', description: 'UUID of the coupon' })
    @ApiParam({ name: 'updateCouponDto', type: Object })
    @ApiResponse({ status: 200, description: 'Coupon updated successfully.' })
    @Role(UserRole.ADMIN)
    @Patch(':id')
    async updateCoupon(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto): Promise<{ success: boolean; message: string; data: CouponEntity }> {
        const updatedCoupon = await this.couponService.updateCoupon(id, updateCouponDto);
        return {
            success: true,
            message: 'Coupon updated successfully',
            data: updatedCoupon,
        };
    }

    /**
     * Deletes a coupon by its ID
     * @param id The ID of the coupon to delete
     * @returns A success message wrapped in a response object
     */
    @ApiProperty({ example: 'Deletes a coupon by ID', description: 'Endpoint to delete a coupon by its ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'UUID of the coupon' })
    @ApiResponse({ status: 200, description: 'Coupon deleted successfully.' })
    @Role(UserRole.ADMIN)
    @Delete(':id')
    async deleteCoupon(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
        const deleted = await this.couponService.deleteCoupon(id);
        return {
            success: true,
            message: deleted,
        };
    }

}
