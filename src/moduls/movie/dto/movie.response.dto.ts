/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class MovieResponseDto {
  @ApiProperty({ example: 'b1a2c3d4', description: 'Unique movie ID (UUID)' })
  movie_id: string;

  @ApiProperty({ example: 'Inception' })
  title: string;

  @ApiProperty({ example: 'A thief who steals corporate secrets through dream-sharing technology...' })
  description?: string;

  @ApiProperty({ example: 148 })
  duration: number;

  @ApiProperty({ example: '2010-07-16' })
  releaseDate: string;

  @ApiProperty({ example: 'https://image.tmdb.org/t/p/original/inception.jpg' })
  posterUrl?: string;

  @ApiProperty({ example: 'https://www.youtube.com/watch?v=YoHD9XEInc0' })
  trailerUrl?: string;

  @ApiProperty({ example: 13 })
  ageRestriction?: number;

  @ApiProperty({ example: 'English' })
  language?: string;

  @ApiProperty({ example: '2025-10-30T14:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-30T14:05:00.000Z' })
  updatedAt: Date;
}
