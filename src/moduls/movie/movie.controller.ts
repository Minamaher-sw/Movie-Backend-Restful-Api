/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create.movie.dot';
import { UpdateMovieDto } from './dto/update.movie.dto';
import { MovieQueryDto } from './dto/movie.query.dto';
import { MovieResponseDto } from './dto/movie.response.dto';
import { UserRole } from '../../utils/enum';
import { Role } from '../../common/decrators/user-role/user-role.decorator';
import { AuthRoleGuard } from '../../common/guards/role_guard/auth.role.guard';
import { MovieEntity } from './entity/movie.entity';
import { MovieListResponse, MovieSingleResponse } from '../../interface/movie.interface';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@ApiTags('Movies')
@Controller('movies')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class MovieController {
  constructor(private readonly movieService: MovieService) { }

  /**
   * Create a new movie (Admin only)
   */
  @Post()
  @Role(UserRole.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Create a new movie (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Movie created successfully',
    type: MovieResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden. Admins only.' })
  public async createMovie(
    @Body() body: CreateMovieDto,
  ): Promise<MovieSingleResponse> {
    const newMovie = await this.movieService.create(body);
    return {
      success: true,
      message: 'Movie created successfully',
      movie: newMovie,
    };
  }

  /**
   * Update movie details by ID (Admin only)
   */
  @Patch(':id')
  @Role(UserRole.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Update movie by ID (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Movie UUID' })
  @ApiResponse({
    status: 200,
    description: 'Movie updated successfully',
    type: MovieResponseDto,
  })
  public async updateMovie(
    @Param('id') id: string,
    @Body() updateMovie: UpdateMovieDto,
  ): Promise<{ success: boolean; message: string; movie: MovieEntity }> {
    const updatedMovie = await this.movieService.update(id, updateMovie);
    return {
      success: true,
      message: 'Movie updated successfully',
      movie: updatedMovie,
    };
  }

  /**
   * Get all movies (with optional filters, pagination, and sorting)
   */
  @Get()
  @ApiOperation({ summary: 'Get all movies with filtering & pagination' })
  @ApiQuery({ name: 'title', required: false, type: String, description: 'Filter by movie title' })
  @ApiQuery({ name: 'genre', required: false, type: String })
  @ApiQuery({ name: 'releaseDate', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: "limit", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Movies fetched successfully',
    type: MovieListResponse,
  })
  @Throttle({
    movie: {
      ttl: 60000,
      limit: 30
    }
  })
  public async getAllMovies(
    @Query() query: MovieQueryDto,
  ): Promise<MovieListResponse> {
    const data = await this.movieService.findAll(query);
    return {
      success: true,
      message: 'Movies fetched successfully',
      movies: data.movies,
      total: data.total,
      pages: data.pages,
    };
  }

  /**
   * 🎞 Get a single movie by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a movie by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Movie UUID' })
  @ApiResponse({
    status: 200,
    description: 'Movie fetched successfully',
    type: MovieSingleResponse,
  })
  @SkipThrottle()
  public async getMovieById(
    @Param('id') id: string,
  ): Promise<MovieSingleResponse> {
    const movie = await this.movieService.findById(id);
    return {
      success: true,
      message: 'Movie fetched successfully',
      movie,
    };
  }

  /**
   * 🗑 Soft delete a movie by ID (Admin only)
   */
  @Delete(':id')
  @Role(UserRole.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({
    summary: 'Soft delete a movie (Admin only)',
    description: 'Marks a movie as inactive instead of permanently deleting it.',
  })
  @ApiResponse({
    status: 200,
    description: 'Movie soft-deleted successfully',
    type: MovieResponseDto,
  })
  public async deleteMovie(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string; movie: MovieEntity }> {
    const movie = await this.movieService.findById(id);
    if (movie.isActive === false) {
      throw new BadRequestException('Movie is already inactive. Cannot perform soft delete.');
    }
    movie.isActive = false;
    movie.deletedAt = new Date();
    const deletedMovie = await this.movieService.update(id, movie);
    return {
      success: true,
      message: 'Movie deleted successfully (soft delete)',
      movie: deletedMovie,
    };
  }
}
