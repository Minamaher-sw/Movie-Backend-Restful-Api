/* eslint-disable prettier/prettier */
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery
} from '@nestjs/swagger';
import { Role } from '../../common/decrators/user-role/user-role.decorator';
import { AuthRoleGuard } from '../../common/guards/role_guard/auth.role.guard';
import { SubscriptionType, UserRole } from '../../utils/enum';
import { CreateSubscriptionPlanDto } from './dto/create-plan.dto';
import { type queryType, SubscriptionPlanService } from './subscription-plan.service';
import { UpdateSubscriptionPlanDto } from './dto/update-plan.dto';
import { SubscriptionPlanResponseDto } from './dto/plan-response.dto';

@ApiTags("Subscription Plans")
@Controller('subscription-plan')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseGuards(AuthRoleGuard)
export class SubscriptionPlanController {

    constructor(private readonly subscriptionPlanService: SubscriptionPlanService) { }

    /**
     * Create a new subscription plan.
     * @role ADMIN Only
     * @param {CreateSubscriptionPlanDto} planData - Plan details
     * @returns Successfully created plan response
     */
    @Post()
    @Role(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create subscription plan (Admin only)' })
    @ApiResponse({ status: 201, description: 'Subscription plan created successfully', type: SubscriptionPlanResponseDto })
    async createSubscriptionPlan(
        @Body() planData: CreateSubscriptionPlanDto,
    ): Promise<{ success: boolean; message: string; data: SubscriptionPlanResponseDto }> {
        const newPlan = await this.subscriptionPlanService.createPlan(planData);
        return {
            success: true,
            message: 'Subscription plan created successfully',
            data: newPlan
        };
    }

    /**
     * Update an existing subscription plan.
     * @role ADMIN Only
     * @param {string} PlanId - Plan ID to update
     * @param {UpdateSubscriptionPlanDto} planData - Updated plan details
     * @returns Updated subscription plan
     */
    @Patch(":PlanId")
    @Role(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update subscription plan (Admin only)' })
    @ApiParam({ name: 'PlanId', description: 'Subscription plan ID' })
    @ApiResponse({ status: 200, description: 'Subscription plan updated successfully', type: SubscriptionPlanResponseDto })
    async updateSubscriptionPlan(
        @Body() planData: UpdateSubscriptionPlanDto,
        @Param('PlanId') PlanId: string,
    ): Promise<{ success: boolean; message: string; data: SubscriptionPlanResponseDto }> {
        const updatedPlan = await this.subscriptionPlanService.updatePlan(PlanId, planData);
        return {
            success: true,
            message: 'Subscription plan updated successfully',
            data: updatedPlan
        };
    }

    /**
     * Fetch subscription plan details by plan name.
     * @public
     * @param {string} planName - Plan name
     * @returns Subscription plan details
     */
    @Get("plans/:planName")
    @ApiOperation({ summary: 'Get subscription plan by name' })
    @ApiParam({ name: 'planName', description: 'Subscription plan name' })
    @ApiResponse({ status: 200, description: 'Subscription plan fetched successfully', type: SubscriptionPlanResponseDto })
    @Role(UserRole.ADMIN, UserRole.USER)
    async getSubscriptionPlanByName(
        @Param('planName') planName: SubscriptionType,
    ): Promise<{ success: boolean; message: string; data: SubscriptionPlanResponseDto }> {
        const plan = await this.subscriptionPlanService.findByName(planName);
        return {
            success: true,
            message: 'Subscription plan fetched successfully',
            data: plan
        };
    }

    /**
     * Fetch subscription plan details by plan ID.
     * @public
     * @param {string} planId - Plan ID
     * @returns Subscription plan details
     */
    @Get(":planId")
    @ApiOperation({ summary: 'Get subscription plan by ID' })
    @ApiParam({ name: 'planId', description: 'Subscription plan ID' })
    @ApiResponse({ status: 200, description: 'Subscription plan fetched successfully', type: SubscriptionPlanResponseDto })
    @Role(UserRole.ADMIN, UserRole.USER)
    async getSubscriptionPlanById(
        @Param('planId') planId: string,
    ): Promise<{ success: boolean; message: string; data: SubscriptionPlanResponseDto }> {
        const plan = await this.subscriptionPlanService.findById(planId);
        return {
            success: true,
            message: 'Subscription plan fetched successfully',
            data: plan
        };
    }

    /**
     * Fetch all active subscription plans.
     * @public
     * @query page - Page number for pagination
     * @query limit - Items per page
     * @returns List of active plans
     */
    @Get("active/plans")
    @ApiOperation({ summary: 'Get all active subscription plans' })
    @ApiQuery({ name: 'page', required: false, description: 'Pagination page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
    @ApiResponse({ status: 200, description: 'Successfully fetched active plans', type: [SubscriptionPlanResponseDto] })
    @Role(UserRole.ADMIN, UserRole.USER)
    async getAllActiveSubscriptionPlans(
        @Query() query: { page: number; limit: number },
    ): Promise<{ success: boolean;pages: number; total: number; message: string; data: SubscriptionPlanResponseDto[] }> {
        const plans = await this.subscriptionPlanService.findAllActivePlans(query.page, query.limit);
        return {
            success: true,
            message: 'Active subscription plans fetched successfully',
            data: plans.plans,
            total: plans.total,
            pages: Math.ceil(plans.total / (query.limit || 10)),

        };
    }

    /**
     * Fetch all subscription plans (Admin).
     * @role ADMIN Only
     * @query page - Page number
     * @query limit - Items per page
     * @returns Paginated subscription plan list
     */
    @Get()
    @Role(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all subscription plans with pagination (Admin only)' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiResponse({ status: 200, description: 'Subscription plans fetched successfully' })
    async getAllSubscriptionPlans(@Query() query: queryType) {
        const { data, total } = await this.subscriptionPlanService.findAll(query);
        return {
            success: true,
            message: 'Subscription plans fetched successfully',
            data,
            total,
            pages: Math.ceil(total / (parseInt(query.limit || '10') || 10))
        };
    }

    /**
     * Delete a subscription plan by ID.
     * @role ADMIN Only
     * @param {string} planId - Plan ID
     * @returns Deletion success message
     */
    @Delete(":planId")
    @Role(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete subscription plan (Admin only)' })
    @ApiParam({ name: 'planId', description: 'Subscription plan ID' })
    @ApiResponse({ status: 200, description: 'Subscription plan deleted successfully' })
    async deleteSubscriptionPlan(
        @Param('planId') planId: string,
    ): Promise<{ success: boolean; message: string }> {
        const retMessage = await this.subscriptionPlanService.deletePlan(planId);
        return {
            success: true,
            message: retMessage
        };
    }
}
