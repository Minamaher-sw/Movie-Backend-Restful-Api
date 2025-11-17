/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponEntity } from './entity/coupon.entity';
import { CreateCouponDto } from './dto/create.coupon.dot';
import { UpdateCouponDto } from './dto/update.coupon.dto';
import { isValidUUID } from '../../utils/check_id_uuid';

@Injectable()
export class CouponService {
    constructor(@InjectRepository(CouponEntity) private CouponsRepository: Repository<CouponEntity>) { }

    /**
     * Creates a new coupon
     * @param couponDto Data for creating the coupon
     * @return The created coupon entity
     */
    public async createCoupon(couponDto: CreateCouponDto): Promise<CouponEntity> {
        if (!couponDto) {
            throw new NotFoundException('Invalid coupon data');
        }
        if(!couponDto.code){
            throw new NotFoundException('Coupon code is required');
        }
        const existingCoupon = await this.CouponsRepository.findOne({ where: { code: couponDto.code } });
        if (existingCoupon) {
            throw new ConflictException('Coupon code already exists');
        }
        const coupon = this.CouponsRepository.create(couponDto);
        return await this.CouponsRepository.save(coupon);
    }

    /** 
     * updates an existing coupon
     * @param couponId UUID of the coupon to update
     * @param couponDto Data for updating the coupon
     */
    public async updateCoupon(couponId: string, couponDto: UpdateCouponDto): Promise<CouponEntity> {
        if (!isValidUUID(couponId)) {
            throw new NotFoundException('Coupon not found');
        }
        const coupon = await this.findCouponById(couponId);
        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }
        Object.assign(coupon, couponDto);
        return await this.CouponsRepository.save(coupon);
    }

    /**
     * Finds a coupon by its UUID
     * @param couponId UUID of the coupon
     * @return The found coupon entity or null if not found
     *
     */
    public async findCouponById(couponId: string): Promise<CouponEntity> {
        if (!isValidUUID(couponId)) {
            throw new NotFoundException('Coupon id not valid');
        }
        const coupon = await this.CouponsRepository.findOne({ where: { coupon_id: couponId } });
        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }
        return coupon;
    }

     /**
     * Finds a coupon using code 
     * @param couponCode  of the coupon
     * @return The found coupon entity or null if not found
     *
     */
    public async findCouponByCode(couponCode: string): Promise<CouponEntity> {
        if (!couponCode) {
            throw new NotFoundException('Coupon code not valid');
        }
        const coupon = await this.CouponsRepository.findOne({ where: { code: couponCode } });
        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }
        return coupon;
    }

    /**
     * Finds all coupons with optional filters, sorting, and pagination
   * @param query Query params for filtering, sorting, and pagination
   */
    public async findAllCoupons(query): Promise<{
        data: CouponEntity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'created_at',
            sortOrder = 'DESC',
            code,
            is_active,
            minDiscount,
            maxDiscount,
            validFrom,
            validTo,
        } = query;

        const qb = this.CouponsRepository.createQueryBuilder('coupon');

        // 🔹 Filtering
        if (code) {
            qb.andWhere('LOWER(coupon.code) LIKE LOWER(:code)', { code: `%${code}%` });
        }

        if (typeof is_active !== 'undefined') {
            const active = is_active === 'true' || is_active === true;
            qb.andWhere('coupon.is_active = :active', { active });
        }

        if (minDiscount) {
            qb.andWhere('coupon.discount_percent >= :minDiscount', { minDiscount });
        }

        if (maxDiscount) {
            qb.andWhere('coupon.discount_percent <= :maxDiscount', { maxDiscount });
        }

        if (validFrom) {
            qb.andWhere('coupon.valid_from >= :validFrom', { validFrom });
        }

        if (validTo) {
            qb.andWhere('coupon.valid_to <= :validTo', { validTo });
        }

        // 🔹 Sorting
        const allowedSortFields = [
            'coupon_id',
            'code',
            'discount_percent',
            'valid_from',
            'valid_to',
            'is_active',
            'created_at',
        ];
        const orderByField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
        const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        qb.orderBy(`coupon.${orderByField}`, orderDirection);

        // 🔹 Pagination
        const take = Math.max(1, Number(limit));
        const skip = (Number(page) - 1) * take;
        qb.skip(skip).take(take);

        // 🔹 Execute and count
        const [data, total] = await qb.getManyAndCount();

        return {
            data,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        };
    }

    /** 
     * Deletes a coupon by its UUID
     * @param couponId UUID of the coupon to delete
     */
    public async deleteCoupon(couponId: string): Promise<string> {
        if (!isValidUUID(couponId)) {
            throw new NotFoundException('Coupon not found');
        }
        const coupon = await this.findCouponById(couponId);
        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }
        await this.CouponsRepository.delete({ coupon_id: couponId });
        return 'Coupon deleted successfully';
    }

}
