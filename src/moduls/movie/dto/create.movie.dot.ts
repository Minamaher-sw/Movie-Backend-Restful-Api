/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsUrl,
  IsBoolean,
  Length,
  Matches,
  IsArray,
  IsUUID,
  ArrayNotEmpty,
} from 'class-validator';
import { PeopleRole } from '../../../utils/enum';

/**
 * {
  "title": "...",
  "genreIds": ["..."],
  "people": [
    { "person_id": "uuid1", "role": "ACTOR" },
    { "person_id": "uuid2", "role": "DIRECTOR" }
  ]
}
 * DTO used for creating a new movie record.
 * Matches the MovieEntity structure.
 */
export class CreateMovieDto {
  /**
   * Movie title (must be unique)
   * @example "Inception"
   */
  @ApiProperty({
    example: 'Inception',
    required: true,
    description: 'Title of the movie (must be unique)',
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @Length(1, 200, { message: 'Title must be between 1 and 200 characters long' })

  title: string;

  /**
   * Movie detailed description or synopsis
   * @example "A thief who steals corporate secrets through dream-sharing technology..."
   */
  @ApiProperty({
    example:
      'A thief who steals corporate secrets through dream-sharing technology...',
    required: true,
    description: 'Detailed movie description or synopsis',
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  @Length(10, 2000, { message: 'Description must be between 10 and 2000 characters long' })
  description: string;

  /**
   * Release date of the movie
   * @example 2000
   */
  @ApiProperty({
    example: 2010,
    description: 'Release year of the movie (YYYY-MM-DD)',
    required: true,
  })
  @IsInt({ message: 'releaseYear must be an integer' })
  @Min(1888, { message: 'releaseYear must be a valid year' })
  releaseYear: number;

  /**
   * Duration of the movie in minutes
   * @example 148
   */
  @ApiProperty({
    example: 148,
    description: 'Duration of the movie in minutes',
    required: true,
  })
  @IsInt({ message: 'Duration must be an integer' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  @Max(1000, { message: 'Duration cannot exceed 1000 minutes' })
  duration: number;

  /**
   * Movie language
   * @example "English"
   */
  @ApiProperty({
    example: 'English',
    description: 'Language of the movie (e.g., English, French, Arabic)',
    required: true,
  })
  @IsString({ message: 'Language must be a string' })
  @Length(2, 100, { message: 'Language must be between 2 and 100 characters' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Language can only contain letters and spaces',
  })
  language: string;

  /**
   * Movie parental rating (e.g., PG-13, R)
   * @example "PG-13"
   */
  @ApiProperty({
    example: 'PG-13',
    description: 'Age restriction or parental rating (e.g., PG-13, R)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Content rating must be a string' })
  @Length(1, 20, { message: 'Content rating must be between 1 and 20 characters' })
  contentRating?: string;

  /**
   * Poster image URL (must be unique)
   * @example "https://cdn.example.com/movies/inception-poster.jpg"
   */
  @ApiProperty({
    example: 'https://cdn.example.com/movies/inception-poster.jpg',
    description: 'Poster image URL (must be unique)',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Poster URL must be a valid URL' })
  posterUrl?: string;

  /**
   * Trailer video URL (must be unique)
   * @example "https://cdn.example.com/movies/inception-trailer.mp4"
   */
  @ApiProperty({
    example: 'https://cdn.example.com/movies/inception-trailer.mp4',
    description: 'Trailer video URL (must be unique)',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Trailer URL must be a valid URL' })
  trailerUrl?: string;

  /**
   * Full movie video URL (must be unique)
   * @example "https://cdn.example.com/movies/inception.mp4"
   */
  @ApiProperty({
    example: 'https://cdn.example.com/movies/inception.mp4',
    description: 'Full movie video URL (must be unique)',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Video URL must be a valid URL' })
  videoUrl?: string;

  /**
   * Whether the movie is active/visible
   * @example true
   */
  @ApiProperty({
    example: true,
    description: 'Indicates whether the movie is currently active or visible',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;

  @ApiProperty({
    example: ['genre-id-1', 'genre-id-2'],
    description: 'List of genre IDs associated with the movie',
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'genreIds cannot be empty' })
  @IsUUID('all', { each: true })
  genreIds: string[];

  @ApiProperty({
    example: [
      { person_id: 'person-uuid-1', role: PeopleRole.DIRECTOR },
      { person_id: 'person-uuid-2', role: PeopleRole.ACTOR },
    ],
    description: 'List of people associated with the movie along with their roles',
    required: false,
  })

  @IsOptional()
  people?: {
    person_id: string;
    role: PeopleRole;
  }[];

}