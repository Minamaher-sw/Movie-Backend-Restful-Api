/* eslint-disable prettier/prettier */
import {
    Entity as Entity6,
    PrimaryGeneratedColumn as PrimaryGeneratedColumn6,
    Column as Column6,
    CreateDateColumn as CreateDateColumn6,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { ApiProperty as ApiProperty6 } from '@nestjs/swagger';
import { SubscriptionType } from '../../../utils/enum';
import { UserEntity } from '../../../moduls/user/entities/user.entity';
import { PaymentEntity } from '../../../moduls/payment/entity/payment.entity';


/** SubscriptionEntity - user subscription records */
@Entity6({ name: 'subscriptions' })
export class SubscriptionEntity {
    @ApiProperty6({ example: 's1a2b3c4-....', description: 'Subscription UUID' })
    @PrimaryGeneratedColumn6('uuid')
    subscription_id: string;


    @ApiProperty6({ enum: SubscriptionType, example: SubscriptionType.BASIC, description: 'Plan name' })
    @Column6({ type: 'enum', enum: SubscriptionType, default: SubscriptionType.BASIC })
    plan_name: SubscriptionType;


    @ApiProperty6({ example: 9.99, description: 'Price in USD' })
    @Column6({ type: 'decimal', precision: 10, scale: 2 })
    price: number;


    @ApiProperty6({ example: '2025-10-01', description: 'Start date' })
    @Column6({ type: 'date' })
    start_date: string;


    @ApiProperty6({ example: '2026-10-01', description: 'End date', required: false })
    @Column6({ type: 'date', nullable: true })
    end_date?: string;


    @ApiProperty6({ example: true, description: 'Is active' })
    @Column6({ type: 'boolean', default: true })
    is_active: boolean;


    @ApiProperty6({ example: '2025-10-01T00:00:00Z', description: 'Created at' })
    @CreateDateColumn6({ type: 'timestamp' })
    created_at: Date;

    @ApiProperty6({ example: 'User associated with the subscription', description: 'User associated with the subscription' })
    @ManyToOne(() => UserEntity, (user) => user.subscriptions)
    user: UserEntity;

    @ApiProperty6({ example: 'Payments associated with the subscription', description: 'Payments associated with the subscription' })
    @OneToMany(() => PaymentEntity, (payment) => payment.subscription)
    payments: PaymentEntity[];
}