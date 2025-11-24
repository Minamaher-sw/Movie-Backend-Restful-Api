/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoviePeopleEntity } from './entity/movie_people.entity';
import { Repository } from 'typeorm';
import { PeopleService } from '../people/people.service';
import { MovieService } from '../movie/movie.service';
import { AssignMultiPersonToMovieDto, AssignPersonToMovieDto } from './dto/assign-movie-people.dto';
import { MoviePeopleResponseDto } from './dto/movie-people-response.dto';
import { UpdateMoviePeopleDto } from './dto/update-movie-people.dto';
import { RemovePersonFromMovieDto } from './dto/remove-movie-person.dto';
import { PeopleRole } from 'src/utils/enum';
import { PeopleResponseDto } from '../people/dto/people-response.dto';

@Injectable()
export class MoviePeopleService {
    constructor(
        @InjectRepository(MoviePeopleEntity) private readonly moviePeopleRepo: Repository<MoviePeopleEntity>,
        private readonly peopleService: PeopleService,
        @Inject(forwardRef(() => MovieService)) private readonly movieService: MovieService,
    ) { }

    /**
     * Assigns a person to a specific movie with a defined role (e.g., ACTOR, DIRECTOR).
     *
     * Workflow:
     * 1. Validates that the person exists.
     * 2. Validates that the movie exists.
     * 3. Checks if a duplicate relation already exists (same person & movie & role).
     * 4. If valid, creates and stores a new MoviePeopleEntity relation.
     *
     * @param {AssignPersonToMovieDto} dto - Contains person_id, movie_id, and role.
     * @returns {Promise<MoviePeopleResponseDto>} The saved relation object.
     *
     * @throws {NotFoundException} If movie or person does not exist.
     * @throws {NotFoundException} If the relation already exists with the same role.
     */
    public async assignPersonToMovie(dto: AssignPersonToMovieDto): Promise<MoviePeopleResponseDto> {
        const person = await this.peopleService.findOneById(dto.person_id);
        const movie = await this.movieService.findById(dto.movie_id);

        const exists = await this.moviePeopleRepo.findOne({
            where: { movie, person, role: dto.role }
        });

        if (exists) {
            throw new NotFoundException(
                `This person is already assigned to this movie with the role ${dto.role}`
            );
        }

        const moviePerson = this.moviePeopleRepo.create({
            movie,
            person,
            role: dto.role
        });
        return await this.moviePeopleRepo.save(moviePerson);
    }

    public async assignMultiPersonToMovie(dto: AssignMultiPersonToMovieDto): Promise<MoviePeopleResponseDto[]> {
        const movie = await this.movieService.findById(dto.movie_id);
        let results: MoviePeopleResponseDto[] = [];
        for (let entry of dto.people) {
            const person = await this.peopleService.findOneById(entry.person_id);
            const exists = await this.moviePeopleRepo.findOne({
                where: { movie, person, role: entry.role }
            });
            if (exists) {
                continue; // Skip duplicates
            }
            const moviePerson = this.moviePeopleRepo.create({
                movie,
                person,
                role: entry.role
            });
            const savedRelation = await this.moviePeopleRepo.save(moviePerson);
            results.push(savedRelation);
        }
        return results;
    }

    /**
     * Updates the role of an already-linked person and movie.
     *
     * Workflow:
     * 1. Validates that the movie-person relation exists.
     * 2. Updates the role in the relation.
     * 3. Saves the updated record.
     *
     * @param {UpdateMoviePeopleDto} dto - Movie ID, Person ID, and the new role.
     * @returns {Promise<MoviePeopleResponseDto>} Updated relation data.
     *
     * @throws {NotFoundException} If the relation does not exist.
     */
    public async updatePersonRole(dto: UpdateMoviePeopleDto): Promise<MoviePeopleResponseDto> {
        let relation =
            (await this.checkRelationExists(dto.movie_id!, dto.person_id!)) || dto;

        relation.role = dto.role!;

        return await this.moviePeopleRepo.save(relation);
    }

    /**
     * Removes a person from a movie entirely (regardless of role).
     *
     * @param {RemovePersonFromMovieDto} dto - Contains movie_id and person_id.
     * @returns {Promise<{ deleted: boolean }>} Confirmation object.
     *
     * @throws {NotFoundException} If the relation does not exist.
     */
    public async removePersonFromMovie(
        dto: RemovePersonFromMovieDto
    ): Promise<{ deleted: boolean }> {
        await this.checkRelationExists(dto.movie_id, dto.person_id);

        await this.moviePeopleRepo.delete({
            movie_id: dto.movie_id,
            person_id: dto.person_id
        });

        return { deleted: true };
    }

    /**
     * Retrieves all people associated with a specific movie filtered by role.
     *
     * @param {string} movieId - UUID of the movie.
     * @param {PeopleRole} role - Role to filter by (ACTOR, DIRECTOR, etc.).
     *
     * @returns {Promise<{ success: boolean; message: string; people: PeopleResponseDto[] }>}
     *
     * @throws {NotFoundException} If the movie does not exist.
     */
    public async getPeopleByMovieAndRole(
        movieId: string,
        role: PeopleRole
    ): Promise<PeopleResponseDto[]> {
        await this.movieService.findById(movieId);

        const peoples = await this.moviePeopleRepo.find({
            where: { movie_id: movieId, role },
            relations: ['person']
        });

        return peoples.map(mp => mp.person);
    }

    /**
     * Gets all people assigned to a movie (regardless of role).
     *
     * @param {string} movie_id - The movie UUID.
     * @returns {Promise<MoviePeopleEntity[]>} List of relations with person included.
     */
    async getAllPeopleInMovie(movie_id: string) {
    return this.moviePeopleRepo.find({
        where: { movie_id },
        relations: ['person']
    });
}

    /**
     * Gets all movies in which a specific person is participating.
     *
     * @param {string} person_id - The person's UUID.
     * @returns {Promise<MoviePeopleEntity[]>} List of movies associated with that person.
     */
    async getMoviesByPerson(person_id: string) {
    return this.moviePeopleRepo.find({
        where: { person_id },
        relations: ['movie']
    });
}

    /**
     * Checks whether a specific movie-person relation exists.
     *
     * Private validation helper used in multiple operations.
     *
     * @private
     * @param {string} movieId - UUID of the movie.
     * @param {string} personId - UUID of the person.
     *
     * @returns {Promise<MoviePeopleEntity>} The relation entity if found.
     *
     * @throws {NotFoundException} If the movie-person relation does not exist.
     */
    private async checkRelationExists(
    movieId: string,
    personId: string
): Promise < MoviePeopleEntity > {
    const relation = await this.moviePeopleRepo.findOne({
        where: {
            movie: { movie_id: movieId },
            person: { person_id: personId }
        }
    });

    if(!relation) {
        throw new NotFoundException(
            `No relation found between movie ID ${movieId} and person ID ${personId}`
        );
    }

        return relation;
}
}
