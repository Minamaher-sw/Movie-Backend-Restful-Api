/* eslint-disable prettier/prettier */

import { ApiProperty } from "@nestjs/swagger";
import { MovieEntity } from "../moduls/movie/entity/movie.entity";

export class MovieListResponse {

  @ApiProperty({ example: true, description: 'Indicates if the request was successful' })
  success: boolean;

  @ApiProperty({ example: 'Movie fetched successfully', description: 'Response message' })
  message: string;
  @ApiProperty({ example: 10, description: 'Total number of movies' })
  count: number;
  @ApiProperty({
    type: () => [MovieEntity],
    description: 'Array of movie objects',
  })
  movies: MovieEntity[];
}

export class MovieSingleResponse {
  @ApiProperty({ example: true, description: 'Indicates if the request was successful' })
  success: boolean;

  @ApiProperty({ example: 'Movie fetched successfully', description: 'Response message' })
  message: string;

  @ApiProperty({
    type: () => MovieEntity,
    description: 'Single movie object',
  })
  movie: MovieEntity;
}
