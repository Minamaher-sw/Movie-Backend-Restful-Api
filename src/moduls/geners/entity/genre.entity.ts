/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { MovieEntity } from "src/moduls/movie/entity/movie.entity";
import { CURRENT_TIMESTAMP } from "src/utils/constants";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity({ name: "geners" })
export class GenreEntity {
    // Define columns and properties for the GenreEntity here
    @ApiProperty({ example: 'e1a2b3c4-....', description: 'Genre UUID' })
    @PrimaryGeneratedColumn('uuid')
    genre_id: string;


    @ApiProperty({ example: 'Action', description: 'Genre name' })
    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;


    @ApiProperty({ example: 'High energy/action movies', description: 'Description', required: false })
    @Column({ type: 'varchar', length: 255, nullable: true })
    description?: string;


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

    @ApiProperty({ example: 'Movies associated with the genre', description: 'Movies associated with the genre' })
    @ManyToMany(() => MovieEntity, (movie) => movie.genres ,{nullable:true })
    @JoinTable({ name: "movie_genres" })
    movies: MovieEntity[];
}