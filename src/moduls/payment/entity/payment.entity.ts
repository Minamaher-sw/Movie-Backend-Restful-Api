/* eslint-disable prettier/prettier */
import {
    Entity as Entity7,
    PrimaryGeneratedColumn as PrimaryGeneratedColumn7,
    Column as Column7,
    CreateDateColumn as CreateDateColumn7,
    ManyToOne,
} from 'typeorm';
import { ApiProperty as ApiProperty7 } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../../../utils/enum';
import { UserEntity } from '../../../moduls/user/entities/user.entity';
import { SubscriptionEntity } from '../../../moduls/subscription/entity/subscription.entity';



/** PaymentEntity - transaction logs */
@Entity7({ name: 'payments' })
export class PaymentEntity {
    @ApiProperty7({ example: 'p1a2b3c4-....', description: 'Payment UUID' })
    @PrimaryGeneratedColumn7('uuid')
    payment_id: string;


    @ApiProperty7({ example: 9.99, description: 'Payment amount' })
    @Column7({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;


    @ApiProperty7({ enum: PaymentMethod, example: PaymentMethod.CARD, description: 'Payment method' })
    @Column7({ type: 'enum', enum: PaymentMethod })
    method: PaymentMethod;


    @ApiProperty7({ enum: PaymentStatus, example: PaymentStatus.SUCCESS, description: 'Payment status' })
    @Column7({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;


    @ApiProperty7({ example: 'txn_123456', description: 'Gateway transaction ID', required: false })
    @Column7({ type: 'varchar', length: 255, nullable: true, unique: true })
    transaction_id?: string;

    @Column7({ type: 'varchar', length: 50, nullable: true })
    @ApiProperty7({ example: 'monthly', description: 'Billing cycle', required: false })
    billing_cycle?: string; // e.g. 'monthly', 'yearly'
    
    @ApiProperty7({ example: '2025-10-02T00:00:00Z', description: 'Payment timestamp' })
    @CreateDateColumn7({ type: 'timestamp' })
    payment_date: Date;

    @ManyToOne(() => UserEntity, (user) => user.payments)
    user: UserEntity;

    @ManyToOne(() => SubscriptionEntity, { onDelete: 'SET NULL', nullable: true })
    subscription?: SubscriptionEntity;
}