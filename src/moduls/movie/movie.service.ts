/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieEntity } from './entity/movie.entity';
import { Like, Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create.movie.dot';
import { UpdateMovieDto } from './dto/update.movie.dto';
import { GenersService } from '../geners/geners.service';
import { MoviePeopleService } from '../movie-people/movie-people.service';

@Injectable()
export class MovieService {
    constructor(
        @InjectRepository(MovieEntity) private readonly movieRepository: Repository<MovieEntity>,
        private readonly genersService: GenersService,
        @Inject(forwardRef(() => MoviePeopleService)) private readonly moviePeopleService: MoviePeopleService,
    ) { }

    // Add your movie-related methods here
    // create movie
    public async create(movieData: CreateMovieDto): Promise<MovieEntity> {
        const existingMovie = await this.checkExistingMovie(movieData)
        if (existingMovie) {
            throw new BadRequestException('Movie with the same title, posterUrl, or videoUrl already exists. Conflicting fields: ' + existingMovie);
        }
        const genres = await this.genersService.findByIds(movieData.genreIds || []);

        const newMovie = this.movieRepository.create({ ...movieData, genres });
        const savedMovie = await this.movieRepository.save(newMovie);

        // If people are provided, assign them to the movie
        if (movieData.people && movieData.people.length > 0) {
            await this.moviePeopleService.assignMultiPersonToMovie({
                movie_id: savedMovie.movie_id,
                people: movieData.people
            });
        }
        return savedMovie;
    }

    // update movie
    public async update(movieId: string, movieData: UpdateMovieDto): Promise<MovieEntity> {
        const movie = await this.getMovieById(movieId);

        // Validation checks
        if (
            movie.title !== movieData.title ||
            movie.posterUrl !== movieData.posterUrl ||
            movie.videoUrl !== movieData.videoUrl
        ) {
            const existingMovie = await this.checkExistingMovie(movieData);
            if (existingMovie) {
                throw new BadRequestException('Conflict: ' + existingMovie);
            }
        }

        // Update genres if provided
        let genres = movie.genres;
        if (movieData.genreIds) {
            genres = await this.genersService.findByIds(movieData.genreIds);
        }

        // Update movie core data
        Object.assign(movie, movieData, { genres });
        const updatedMovie = await this.movieRepository.save(movie);

        // ---- HANDLE PEOPLE ----
        if (movieData.people) {
            // 1) remove all old relations
            const oldRelations = await this.moviePeopleService.getAllPeopleInMovie(movieId);
            for (const rel of oldRelations) {
                await this.moviePeopleService.removePersonFromMovie({
                    movie_id: movieId,
                    person_id: rel.person_id
                });
            }

            // 2) insert new ones
            await this.moviePeopleService.assignMultiPersonToMovie({
                movie_id: movieId,
                people: movieData.people
            });
        }

        return updatedMovie;
    }


    /**
     * Get all movies with optional filters and pagination
     * @param query Query parameters for filtering and pagination
     * @returns Array of movies matching the filters
     */
    public async findAll(query: any): Promise<{ movies: MovieEntity[]; total: number; pages: number }> {
        const filters: any = {
            ...(query?.title ? { title: Like(`%${query.title}%`) } : {}),
            ...(query?.genre ? { genre: query.genre } : {}),
            ...(query?.releaseDate ? { releaseDate: query.releaseDate } : {}),
        };
        const sort: any = {
            ...(query?.sortBy ? { [query.sortBy]: query.sortOrder === 'DESC' ? 'DESC' : 'ASC' } : { movie_id: 'ASC' }),
        };
        const skipPage: number | undefined = query?.page && query?.limit ? (parseInt(query.page) - 1) * parseInt(query.limit) : undefined;
        const numMoviePerPage: number | undefined = query?.limit ? parseInt(query.limit) : undefined;

        const [movies, total] = await this.movieRepository.findAndCount({ where: filters, order: sort, skip: skipPage, take: numMoviePerPage });
        return { movies, total, pages: numMoviePerPage ? Math.ceil(total / numMoviePerPage) : 1 };
    }

    // findByID 
    public async findById(movieId: string): Promise<MovieEntity> {
        const movie = await this.getMovieById(movieId);
        return movie;
    }

    // get movie by id 
    private async getMovieById(movieId: string): Promise<MovieEntity> {
        const movie = await this.movieRepository.findOne(
            { where: { movie_id: movieId }, relations: ['genres'] }
        );
        if (!movie) {
            throw new NotFoundException("Movie not Found");
        }
        return movie;
    }

    private async checkExistingMovie(movieData: UpdateMovieDto) {
        const existingMovie = await this.movieRepository.findOne({
            where: [
                { title: movieData.title },
                { posterUrl: movieData.posterUrl },
                { videoUrl: movieData.videoUrl }
            ]
        });

        if (existingMovie) {
            const conflictFields: string[] = [];
            if (existingMovie.title === movieData.title) conflictFields.push('title');
            if (existingMovie.posterUrl === movieData.posterUrl) conflictFields.push('posterUrl');
            if (existingMovie.videoUrl === movieData.videoUrl) conflictFields.push('videoUrl');

            return conflictFields.join(', ');
        }
        else {
            return false
        }
    }

    public async delete(movieId: string): Promise<{ message: string }> {
        const movie = await this.getMovieById(movieId);
        await this.movieRepository.remove(movie);
        return { message: 'Movie deleted successfully' };
    }
}
