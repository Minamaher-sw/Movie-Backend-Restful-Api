/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create.coupon.dot';
import { UpdateCouponDto } from './dto/update.coupon.dto';
import { CouponEntity } from './entity/coupon.entity';
import { ApiTags, ApiResponse, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { isValidUUID } from '../../utils/check_id_uuid';
import { AuthRoleGuard } from '../../common/guards/role_guard/auth.role.guard';
import { Role } from '../../common/decrators/user-role/user-role.decorator';
import { UserRole } from '../../utils/enum';

@ApiTags('Coupons')
@Controller('coupons')
@UseGuards(AuthRoleGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  /**
   * Create a new coupon
   */
  @Post()
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiResponse({ status: 201, description: 'Coupon created successfully', type: CouponEntity })
  async createCoupon(
    @Body() createCouponDto: CreateCouponDto,
  ): Promise<{ success: boolean; message: string; data: CouponEntity }> {
    const newCoupon = await this.couponService.createCoupon(createCouponDto);
    return { success: true, message: 'Coupon created successfully', data: newCoupon };
  }

  /**
   * Get all coupons with filter, sort and pagination
   */
  @Get()
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all coupons with optional filter, sort and pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'Search by code or description', type: String })
  @ApiQuery({ name: 'is_active', required: false, description: 'Filter by active status', type: Boolean })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field', type: String })
  @ApiQuery({ name: 'order', required: false, description: 'Sort order', enum: ['ASC', 'DESC'] })
  @ApiResponse({ status: 200, description: 'Coupons retrieved successfully' })
  async getAllCoupons(
    @Query() query: {
      page?: string;
      limit?: string;
      search?: string;
      is_active?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
  ): Promise<{ success: boolean; message: string; data: any }> {
    const { page, limit, search, is_active, sortBy, sortOrder } = query;
    const queryOptions = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search: search || undefined,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    };
    const coupons = await this.couponService.getAllCoupons(queryOptions);
    return { success: true, message: 'Coupons retrieved successfully', data: coupons };
  }

  /**
   * Get a coupon by id or code
   */
  @Get(':id')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a coupon by ID or code' })
  @ApiParam({ name: 'id', description: 'Coupon UUID or code' })
  @ApiResponse({ status: 200, description: 'Coupon retrieved successfully', type: CouponEntity })
  async getCouponById(@Param('id') id: string): Promise<{ success: boolean; message: string; data: CouponEntity }> {
    if (!isValidUUID(id)) throw new NotFoundException('Coupon id not valid');
    const coupon = await this.couponService.getCoupon(id);
    return { success: true, message: 'Coupon retrieved successfully', data: coupon };
  }

  /**
   * Update a coupon
   */
  @Patch(':id')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a coupon by ID' })
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiResponse({ status: 200, description: 'Coupon updated successfully', type: CouponEntity })
  async updateCoupon(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<{ success: boolean; message: string; data: CouponEntity }> {
    const updatedCoupon = await this.couponService.updateCoupon(id, updateCouponDto);
    return { success: true, message: 'Coupon updated successfully', data: updatedCoupon };
  }

  /**
   * Delete a coupon
   */
  @Delete(':id')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a coupon by ID' })
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiResponse({ status: 200, description: 'Coupon deleted successfully' })
  async deleteCoupon(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.couponService.deleteCoupon(id);
    return { success: true, message: 'Coupon deleted successfully' };
  }

  /**
   * Validate a coupon (used for frontend before applying)
   */
  @Get(':code/validate')
  @ApiOperation({ summary: 'Validate a coupon code' })
  @ApiParam({ name: 'code', description: 'Coupon code' })
  @ApiResponse({ status: 200, description: 'Coupon is valid', type: CouponEntity })
  async validateCoupon(@Param('code') code: string): Promise<{ success: boolean; message: string; data: CouponEntity }> {
    const coupon = await this.couponService.validateCoupon(code);
    return { success: true, message: 'Coupon is valid', data: coupon };
  }

  /**
   * Increment coupon use count (after payment success)
   */
  @Post(':code/increment')
  @ApiOperation({ summary: 'Increment coupon use count' })
  @ApiParam({ name: 'code', description: 'Coupon code' })
  @ApiResponse({ status: 200, description: 'Coupon use count incremented', type: CouponEntity })
  async incrementUseCount(@Param('code') code: string): Promise<{ success: boolean; message: string; data: CouponEntity }> {
    const coupon = await this.couponService.incrementUseCount(code);
    return { success: true, message: 'Coupon use count incremented', data: coupon };
  }

  /**
   * Get all users who used a coupon
   */
  @Get(':id/users')
  @ApiOperation({ summary: 'Get all users who used a specific coupon' })
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsersByCoupon(@Param('id') id: string): Promise<{ success: boolean; message: string; data: any }> {
    const users = await this.couponService.getUsersByCoupon(id);
    return { success: true, message: 'Users retrieved successfully', data: users };
  }
}
