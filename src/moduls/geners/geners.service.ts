/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GenreEntity } from './entity/genre.entity';
import { Repository, In } from 'typeorm';
import { CreateGenreDto } from './dto/create.geners.dot';
import { UpdateGenreDto } from './dto/update.geners.dto';

@Injectable()
export class GenersService {
  constructor(
    @InjectRepository(GenreEntity)
    private readonly genreRepository: Repository<GenreEntity>,
  ) {}

  async findAll(query: any): Promise<GenreEntity[]> {
    const filters = {
      ...(query.name && { name: query.name }),
      ...(query.description && { description: query.description }),
    };

    const sort = {
      ...(query.sortBy && { [query.sortBy]: query.order === 'DESC' ? 'DESC' : 'ASC' }),
    };

    const skip = query.page && query.limit ? (query.page - 1) * query.limit : 0;
    const take = query.limit ? query.limit : 10;

    const genres = await this.genreRepository.find({
      where: filters,
      order: sort,
      skip,
      take,
    });

    if (genres.length === 0) {
      throw new NotFoundException('No genres found');
    }

    return genres;
  }

  async findById(genreId: string): Promise<GenreEntity> {
    const genre = await this.genreRepository.findOne({ where: { genre_id: genreId } });
    if (!genre) throw new NotFoundException('Genre not found');
    return genre;
  }

  async findByIds(genreIds: string[]): Promise<GenreEntity[]> {
    if (!genreIds?.length) {
      throw new BadRequestException('No genre IDs provided');
    }

    const genres = await this.genreRepository.findBy({ genre_id: In(genreIds) });

    if (genres.length === 0) {
      throw new NotFoundException('No genres found');
    }

    return genres;
  }

  async findByName(name: string): Promise<GenreEntity> {
    const genre = await this.genreRepository.findOne({ where: { name } });
    if (!genre) throw new NotFoundException('Genre not found');
    return genre;
  }

  async createGenre(genreData: CreateGenreDto): Promise<GenreEntity> {
    if (!genreData.name) {
      throw new BadRequestException('Genre name is required');
    }

    const existing = await this.genreRepository.findOne({ where: { name: genreData.name } });
    if (existing) {
      throw new BadRequestException('Genre with this name already exists');
    }

    const genre = this.genreRepository.create(genreData);
    return await this.genreRepository.save(genre);
  }

  async updateGenre(genreId: string, genreData: UpdateGenreDto): Promise<GenreEntity> {
    const genre = await this.findById(genreId);

    if (genreData.name && genreData.name !== genre.name) {
      const existing = await this.genreRepository.findOne({ where: { name: genreData.name } });
      if (existing) {
        throw new BadRequestException('Genre with this name already exists');
      }
    }

    Object.assign(genre, genreData);
    return await this.genreRepository.save(genre);
  }

  async deleteGenre(genreId: string): Promise<void> {
    const genre = await this.findById(genreId);
    if (!genre) {
      throw new BadRequestException('Genre is Deleted Already');
    }
    await this.genreRepository.delete({ genre_id: genreId });
  }
}
