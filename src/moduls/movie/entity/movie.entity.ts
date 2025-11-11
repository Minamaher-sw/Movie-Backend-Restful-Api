/* eslint-disable prettier/prettier */
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
    ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MoviePeopleEntity } from '../../movie-people/entity/movie_people.entity';
import { RatingEntity } from 'src/moduls/rating/entity/rating.entity';
import { GenreEntity } from 'src/moduls/geners/entity/genre.entity';

@Entity('movies')
export class MovieEntity {
    //  Primary Key
    @ApiProperty({ 
        example: '1b2c3d4e-5f6g-7h8i-9j0k-lmnopqrstuv',
        description: 'Unique movie ID' 
     })
    @PrimaryGeneratedColumn("uuid")
    movie_id: string;

    //  Basic Info
    @ApiProperty({ example: 'Inception', description: 'Movie title' })
    @Column({ type: 'varchar', length: 200, unique: true, comment: "title must be unique" })
    title: string;

    @ApiProperty({
        example: 'A thief who steals corporate secrets through dream-sharing technology...',
        description: 'Detailed movie description or synopsis',
    })
    @Column({ type: 'text' })
    description: string;

    //  Metadata
    @ApiProperty({ example: 2000, description: 'Release year of the movie' })
    @Column({ type: 'int' ,default: () => "2000" })
    releaseYear: number;

    @ApiProperty({ example: 148, description: 'Duration in minutes' })
    @Column({ type: 'int' })
    duration: number; // in minutes

    @ApiProperty({ example: 'English', description: 'Language of the movie' })
    @Column({ type: 'varchar', length: 100 })
    language: string;

    @ApiProperty({ example: 'PG-13', description: 'Age restriction or parental rating' })
    @Column({ type: 'varchar', length: 20, default: 'PG-13' })
    contentRating: string;

    //  Media URLs
    @ApiProperty({ example: 'https://cdn.example.com/movies/inception-poster.jpg', description: 'Poster image URL' })
    @Column({ type: 'varchar', length: 500, nullable: true ,unique:true })
    posterUrl?: string;

    @ApiProperty({ example: 'https://cdn.example.com/movies/inception-trailer.mp4', description: 'Trailer video URL' })
    @Column({ type: 'varchar', length: 500, nullable: true ,unique:true })
    trailerUrl?: string;

    @ApiProperty({ example: 'https://cdn.example.com/movies/inception.mp4', description: 'Full movie file URL' })
    @Column({ type: 'varchar', length: 500, nullable: true ,unique:true })
    videoUrl?: string;

    //  Activity
    @ApiProperty({ example: true, description: 'Indicates whether the movie is currently active/visible' })
    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    //  System Fields
    @ApiProperty({ example: '2025-10-30T12:00:00Z', description: 'Record creation timestamp' })
    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
    })
    createdAt: Date;
    @ApiProperty({ example: '2025-10-31T12:00:00Z', description: 'Record update timestamp' })
    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
    })
    updatedAt: Date;
    @ApiProperty({ example: null, description: 'Soft delete timestamp (if deleted)' })
    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deletedAt?: Date;

    /* Relations */
    @ManyToMany(() => GenreEntity, (movie) => movie.movies ,{nullable:true })
    genres: GenreEntity[];

    @OneToMany(() => MoviePeopleEntity,(moviePeople)=> moviePeople.movie)
    people: MoviePeopleEntity[];

    @OneToMany(() => RatingEntity, (rating) => rating.movie)
    ratings: RatingEntity[];
}
