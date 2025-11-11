/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieEntity } from './entity/movie.entity';
import { Like, Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create.movie.dot';
import { UpdateMovieDto } from './dto/update.movie.dto';

@Injectable()
export class MovieService {
    constructor(@InjectRepository(MovieEntity) private readonly movieRepository: Repository<MovieEntity>) { }

    // Add your movie-related methods here
    // create movie
    public async create(movieData: CreateMovieDto): Promise<MovieEntity> {
        const existingMovie =  await this.checkExistingMovie(movieData)
        if(existingMovie)
        {
            throw new BadRequestException('Movie with the same title, posterUrl, or videoUrl already exists. Conflicting fields: ' + existingMovie);
        }
        const newMovie = this.movieRepository.create(movieData);
        return await this.movieRepository.save(newMovie);
       
    }

    // update movie
    public async update(movieId: string, movieData: UpdateMovieDto): Promise<MovieEntity> {
        const movie = await this.getMovieById(movieId);
        if(!movie){
            throw new NotFoundException("Movie not Found");
        }
        if(movie.title !== movieData.title || movie.posterUrl !== movieData.posterUrl || movie.videoUrl !== movieData.videoUrl){
            const existingMovie = await this.checkExistingMovie(movieData);
            if(existingMovie) {
                throw new BadRequestException('Movie with the same title, posterUrl, or videoUrl already exists. Conflicting fields: ' + existingMovie);
            }
        }
        Object.assign(movie, movieData);
        return await this.movieRepository.save(movie);
    }
    /**
     * Get all movies with optional filters and pagination
     * @param query Query parameters for filtering and pagination
     * @returns Array of movies matching the filters
     */
    public async findAll(query: any): Promise<MovieEntity[]> {
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

        return await this.movieRepository.find({ where: filters, order: sort, skip: skipPage, take: numMoviePerPage });
    }

    // findByID 
    public async findById(movieId: string): Promise<MovieEntity> {
        const movie = await this.getMovieById(movieId);
        return movie;
    }

    // get movie by id 
    private async getMovieById(movieId: string): Promise<MovieEntity> {
        const movie = await this.movieRepository.findOneBy({ movie_id: movieId });
        if (!movie) {
            throw new NotFoundException("Movie not Found");
        }
        return movie;
    }

    private async checkExistingMovie(movieData :  UpdateMovieDto){
       const existingMovie = await this.movieRepository.findOne({
            where: [
                { title: movieData.title },
                { posterUrl: movieData.posterUrl },
                { videoUrl: movieData.videoUrl }
            ]
        });

        if (existingMovie) {
            const conflictFields :string[] = [];
            if (existingMovie.title === movieData.title) conflictFields.push('title');
            if (existingMovie.posterUrl === movieData.posterUrl) conflictFields.push('posterUrl');
            if (existingMovie.videoUrl === movieData.videoUrl) conflictFields.push('videoUrl');

            return conflictFields.join(', ');
        }
        else{
            return false
        }
    }
}
