/* eslint-disable prettier/prettier */
import {
    Entity as Entity11,
    PrimaryColumn as PrimaryColumn11,
    ManyToOne as ManyToOne11,
    CreateDateColumn as CreateDateColumn11,
} from 'typeorm';
import { UserEntity as UserEntity11 } from 'src/user/entities/user.entity';
import { CouponEntity as CouponEntity11 } from '../../coupon/entity/coupon.entity';


/** UserCoupons - tracks coupon redemptions by users */
@Entity11({ name: 'user_coupons' })
export class UserCouponsEntity {
    @PrimaryColumn11({ type: 'uuid' })
    user_id: string;


    @PrimaryColumn11({ type: 'uuid' })
    coupon_id: string;


    @CreateDateColumn11({ type: 'timestamp' })
    redeemed_at: Date;


    @ManyToOne11(() => UserEntity11, { onDelete: 'CASCADE' })
    user: UserEntity11;


    @ManyToOne11(() => CouponEntity11, { onDelete: 'CASCADE' })
    coupon: CouponEntity11;
}