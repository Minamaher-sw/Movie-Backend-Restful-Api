/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PeopleEntity } from './entity/people.entity';
import { PeopleResponseDto } from './dto/people-response.dto';
import { CreatePeopleDto } from './dto/create-people.dto';
import { UpdatePeopleDto } from './dto/update-people.dto';
import { PeopleQuery } from '../../interface/people-interface-query';

@Injectable()
export class PeopleService {
    constructor(
        @InjectRepository(PeopleEntity)
        private readonly peopleRepository: Repository<PeopleEntity>,
    ) {}

    /**
     * @summary Create a new person
     * @description Creates a new person record and validates username uniqueness.
     * @param {CreatePeopleDto} createPeopleDto
     * @returns {Promise<PeopleResponseDto>}
     * @throws {ConflictException} If username already exists
     */
    public async createPerson(createPeopleDto: CreatePeopleDto): Promise<PeopleResponseDto> {
        const existing = await this.peopleRepository.findOne({
            where: { username: createPeopleDto.username },
        });

        if (existing) {
            throw new ConflictException(`Person with username "${createPeopleDto.username}" already exists.`);
        }

        const newPerson = this.peopleRepository.create(createPeopleDto);
        return (await this.peopleRepository.save(newPerson)) as PeopleResponseDto;
    }

    /**
     * @summary Get list of people
     * @description Supports filtering, sorting, and pagination.
     * @param {PeopleQuery} query
     * @returns Paginated list of people
     */
    public async findAll(query: PeopleQuery): Promise<{ data: PeopleResponseDto[]; total: number; page: number; limit: number }> {
        const {
            first_name,
            last_name,
            username,
            nationality,
            sortBy = 'created_at',
            sortOrder = 'DESC',
            page = 1,
            limit = 10,
        } = query;

        const qb = this.peopleRepository.createQueryBuilder('people')
            .leftJoinAndSelect('people.moviepeople', 'movie_people');

        if (first_name) qb.andWhere('people.first_name LIKE :first', { first: `%${first_name}%` });
        if (last_name) qb.andWhere('people.last_name LIKE :last', { last: `%${last_name}%` });
        if (username) qb.andWhere('people.username LIKE :username', { username: `%${username}%` });
        if (nationality) qb.andWhere('people.nationality LIKE :nat', { nat: `%${nationality}%` });

        qb.orderBy(`people.${sortBy}`, sortOrder);
        qb.skip((page - 1) * limit).take(limit);

        const [data, total] = await qb.getManyAndCount();
        return { data: data as PeopleResponseDto[], total, page, limit };
    }

    /**
     * @summary Get person by ID
     * @param {string} person_id
     * @returns {Promise<PeopleResponseDto>}
     * @throws {NotFoundException}
     */
    public async findOneById(person_id: string): Promise<PeopleResponseDto> {
        const person = await this.peopleRepository.findOne({
            where: { person_id },
            relations: ['moviepeople'],
        });

        if (!person) throw new NotFoundException(`Person with ID "${person_id}" not found.`);

        return person as PeopleResponseDto;
    }

    /**
     * @summary Get person by username
     * @param {string} username
     * @returns {Promise<PeopleResponseDto>}
     * @throws {NotFoundException}
     */
    public async findByUsername(username: string): Promise<PeopleResponseDto> {
        const person = await this.peopleRepository.findOne({
            where: { username },
            relations: ['movie_people'],
        });

        if (!person) throw new NotFoundException(`Person with username "${username}" not found.`);

        return person as PeopleResponseDto;
    }

    /**
     * @summary Update person by ID
     * @param {string} person_id
     * @param {UpdatePeopleDto} updatePeopleDto
     */
    public async updatePersonById(person_id: string, updatePeopleDto: UpdatePeopleDto): Promise<PeopleResponseDto> {
        const person = await this.findOneById(person_id);
        const updated = Object.assign(person, updatePeopleDto);
        return (await this.peopleRepository.save(updated)) as PeopleResponseDto;
    }

    /**
     * @summary Update person by username
     * @param {string} username
     * @param {UpdatePeopleDto} updatePeopleDto
     */
    public async updatePersonByUsername(username: string, updatePeopleDto: UpdatePeopleDto): Promise<PeopleResponseDto> {
        const person = await this.findByUsername(username);
        const updated = Object.assign(person, updatePeopleDto);
        return (await this.peopleRepository.save(updated)) as PeopleResponseDto;
    }

    /**
     * @summary Delete person by ID
     * @param {string} person_id
     */
    public async deletePerson(person_id: string): Promise<{ message: string }> {
        const person = await this.findOneById(person_id);
        await this.peopleRepository.remove(person);
        return { message: `Person with ID "${person_id}" has been deleted successfully.` };
    }
}
