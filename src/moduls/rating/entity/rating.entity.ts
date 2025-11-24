/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { MovieEntity } from "../../../moduls/movie/entity/movie.entity";
import { UserEntity } from "../../../moduls/user/entities/user.entity";

import { CURRENT_TIMESTAMP } from "../../../utils/constants";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "ratings" })
export class RatingEntity {
    @ApiProperty({ example: 'r1a2b3c4-....', description: 'Rating UUID' })
    @PrimaryGeneratedColumn('uuid')
    rating_id: string;


    @ApiProperty({ example: 3, description: 'Rating value 1-5' })
    @Column({ type: 'int' })
    rating: number;


    @ApiProperty({ example: 'Great movie!', description: 'Optional review text', required: false })
    @Column({ type: 'text', nullable: true })
    comment?: string;

    @ApiProperty({
        example: '2025-10-30T10:25:00.000Z',
        description: 'Timestamp when the user record was created',
    })
    @CreateDateColumn({
        type: 'timestamp',
        default: () => CURRENT_TIMESTAMP,
    })
    createdAt: Date;

    @ApiProperty({
        example: '2025-10-31T10:25:00.000Z',
        description: 'Timestamp when the user record was last updated',
    })
    @UpdateDateColumn({
        type: 'timestamp',
        default: () => CURRENT_TIMESTAMP,
        onUpdate: CURRENT_TIMESTAMP,
    })
    updatedAt: Date;

    @ApiProperty({ example: null, description: 'Soft delete timestamp (if deleted)' })
    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deletedAt?: Date;

    @ApiProperty({ example: 'User associated with the rating', description: 'User associated with the rating' ,type: () => UserEntity }   )
    @ManyToOne(() => UserEntity, (user) => user.ratings, { onDelete: 'CASCADE' , nullable: false ,onUpdate: 'CASCADE' })
    user: UserEntity;

    @ApiProperty({ example: 'Movie associated with the rating', description: 'Movie associated with the rating' ,type: () => MovieEntity }   )
    @ManyToOne(() => MovieEntity, (movie) => movie.ratings, { onDelete: 'CASCADE' , nullable: false ,onUpdate: 'CASCADE' })
    movie: MovieEntity;
}