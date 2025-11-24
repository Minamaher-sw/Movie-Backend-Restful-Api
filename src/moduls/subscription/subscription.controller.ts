/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Role } from '../../common/decrators/user-role/user-role.decorator';
import { UserRole } from '../../utils/enum';
import { AuthRoleGuard } from '../../common/guards/role_guard/auth.role.guard';
import { CurrentUser } from '../../common/decrators/currentuser/currentuser.decorator';
import { type JwtPayloadType2 } from '../../utils/types';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Subscriptions')
@Controller('subscription')
@UseGuards(AuthRoleGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  /**
   * Create a pending subscription for the authenticated user.
   * Optional coupon can be applied during creation.
   * @param payload - Authenticated user's JWT payload
   * @param planId - UUID of the subscription plan
   * @param couponCode - Optional coupon code
   * @returns Created subscription data
   */
  @Post(':planId')
  @Role(UserRole.USER)
  @ApiOperation({ summary: 'Create a pending subscription for current user' })
  @ApiParam({ name: 'planId', type: String, description: 'Subscription plan ID' })
  @ApiQuery({ name: 'coupon', required: false, type: String, description: 'Optional coupon code' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  async createPendingSubscription(
    @CurrentUser() payload: JwtPayloadType2,
    @Param('planId') planId: string,
    @Query('coupon') couponCode?: string,
  ): Promise<{ success: boolean; message: string; data: SubscriptionResponseDto }> {
    const subscription = await this.subscriptionService.createPendingSubscription(
      payload.userId,
      planId,
      couponCode,
    );

    return {
      success: true,
      message: 'Subscription created successfully',
      data: subscription,
    };
  }

  /**
   * Get all subscriptions (Admin only).
   * Supports pagination, sorting, and filtering by active status.
   * @param query - Pagination, filter and sorting options
   * @returns Paginated subscriptions list with meta
   */
  @Get("active")
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all active subscriptions' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiResponse({ status: 200, description: 'Subscriptions fetched successfully' })
  async getAllActiveSubscriptions(
    @Query() query: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: SubscriptionResponseDto[];
    total: number;
    pages: number;
  }> {
    const { subscriptions, total } = await this.subscriptionService.getActiveSubscriptions(query);

    return {
      success: true,
      message: 'Subscriptions fetched successfully',
      data: subscriptions,
      total: total,
      pages: Math.ceil(total / (parseInt(query.limit) || 10)),
    };
  }
  /**
   * Get subscription by ID. Users can only access their own subscriptions unless admin.
   * @param subscriptionId - UUID of the subscription
   * @param user - Authenticated user's JWT payload
   * @returns Subscription data if authorized
   */
  @Get(':subscriptionId')
  @Role(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiParam({ name: 'subscriptionId', type: String, description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription fetched successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden. Access denied' })
  async getSubscriptionById(
    @Param('subscriptionId') subscriptionId: string,
    @CurrentUser() user: JwtPayloadType2,
  ): Promise<{ success: boolean; message: string; data: SubscriptionResponseDto | null }> {
    const subscription = await this.subscriptionService.getSubscriptionById(subscriptionId);

    if (subscription.user.user_id !== user.userId && user.role !== UserRole.ADMIN) {
      return {
        success: false,
        message: 'You do not have permission to access this subscription',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Subscription fetched successfully',
      data: subscription,
    };
  }

  /**
   * Get all subscriptions (Admin only).
   * Supports pagination, sorting, and filtering by active status.
   * @param query - Pagination, filter and sorting options
   * @returns Paginated subscriptions list with meta
   */
  @Get()
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all subscriptions (Admin Only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Subscriptions fetched successfully' })
  async getAllSubscriptions(
    @Query() query: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: SubscriptionResponseDto[];
    total: number;
    pages: number;
  }> {
    const { subscriptions, total } = await this.subscriptionService.getAllSubscriptions(query);

    return {
      success: true,
      message: 'Subscriptions fetched successfully',
      data: subscriptions,
      total: total,
      pages: Math.ceil(total / (parseInt(query.limit) || 10)),
    };
  }

  /**
   * Get subscriptions for a specific user. Admin can access any user; normal user can access only their own.
   * Supports pagination and filtering by active status.
   * @param userID - UUID of the user
   * @param user - Authenticated user's JWT payload
   * @param query - Pagination and filter options
   * @returns List of subscriptions for the target user
   */
  @Get('user/:userID')
  @Role(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get subscriptions for a specific user' })
  @ApiParam({ name: 'userID', type: String, description: 'User ID' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Subscriptions fetched successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden. User does not own the data' })
  async getSubscriptionsByUserId(
    @Param('userID') userID: string,
    @CurrentUser() user: JwtPayloadType2,
    @Query() query: any,
  ): Promise<{ success: boolean; message: string; data: SubscriptionResponseDto[] | null }> {
    if (user.role !== UserRole.ADMIN && user.userId !== userID) {
      return {
        success: false,
        message: 'You do not have permission to access these subscriptions',
        data: null,
      };
    }

    const subscriptions = await this.subscriptionService.getUserSubscriptions(userID, {
      limit: query.limit,
      page: query.page,
      is_active: query.is_active,
    });

    return {
      success: true,
      message: 'Subscriptions fetched successfully',
      data: subscriptions,
    };
  }
}
