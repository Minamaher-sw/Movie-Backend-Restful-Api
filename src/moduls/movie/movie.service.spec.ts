/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MovieEntity } from './entity/movie.entity';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create.movie.dot';
import { UpdateMovieDto } from './dto/update.movie.dto';

export type Options = {
  where: {
    title: string,
    gener: string,
    releaseDate: string
  },
  order: {
    [key: string]: 'ASC' | 'DESC'
  },
  skip?: number,
  take?: number
}

export type MovieTestType = {
  id?: number;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  language: string;
  contentRating: string;
  posterUrl: string;
  trailerUrl: string;
  videoUrl: string;
  isActive: boolean;
}

let movies: MovieTestType[] = [
    {
      id: 1,
      title: 'Inception',
      description:
        'A thief who steals corporate secrets through dream-sharing technology is given a chance to have his criminal history erased if he can plant an idea into someone’s subconscious.',
      releaseYear: 2010,
      duration: 148,
      language: 'English',
      contentRating: 'PG-13',
      posterUrl: 'https://cdn.example.com/movies/inception-poster.jpg',
      trailerUrl: 'https://cdn.example.com/movies/inception-trailer.mp4',
      videoUrl: 'https://cdn.example.com/movies/inception.mp4',
      isActive: true,
    },
    {
      id: 2,
      title: 'The Matrix',
      description:
        'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
      releaseYear: 1999,
      duration: 136,
      language: 'English',
      contentRating: 'R',
      posterUrl: 'https://cdn.example.com/movies/matrix-poster.jpg',
      trailerUrl: 'https://cdn.example.com/movies/matrix-trailer.mp4',
      videoUrl: 'https://cdn.example.com/movies/matrix.mp4',
      isActive: true,
    },
    {
      id: 3,
      title: 'Interstellar',
      description:
        "A team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival.",
      releaseYear: 2014,
      duration: 169,
      language: 'English',
      contentRating: 'PG-13',
      posterUrl: 'https://cdn.example.com/movies/interstellar-poster.jpg',
      trailerUrl: 'https://cdn.example.com/movies/interstellar-trailer.mp4',
      videoUrl: 'https://cdn.example.com/movies/interstellar.mp4',
      isActive: true,
    },
    {
      id: 4,
      title: 'Parasite',
      description:
        'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
      releaseYear: 2019,
      duration: 132,
      language: 'Korean',
      contentRating: 'R',
      posterUrl: 'https://cdn.example.com/movies/parasite-poster.jpg',
      trailerUrl: 'https://cdn.example.com/movies/parasite-trailer.mp4',
      videoUrl: 'https://cdn.example.com/movies/parasite.mp4',
      isActive: true,
    },
    {
      id: 5,
      title: 'Avatar',
      description:
        'A paraplegic Marine dispatched to the moon Pandora becomes torn between following his orders and protecting the world he feels is his home.',
      releaseYear: 2009,
      duration: 162,
      language: 'English',
      contentRating: 'PG-13',
      posterUrl: 'https://cdn.example.com/movies/avatar-poster.jpg',
      trailerUrl: 'https://cdn.example.com/movies/avatar-trailer.mp4',
      videoUrl: 'https://cdn.example.com/movies/avatar.mp4',
      isActive: true,
    },
    {
      id: 6,
      title: 'The Dark Knight',
      description:
        'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      releaseYear: 2008,
      duration: 152,
      language: 'English',
      contentRating: 'PG-13',
      posterUrl: 'https://cdn.example.com/movies/darkknight-poster.jpg',
      trailerUrl: 'https://cdn.example.com/movies/darkknight-trailer.mp4',
      videoUrl: 'https://cdn.example.com/movies/darkknight.mp4',
      isActive: true,
    },
  ];
describe('MovieService', () => {
  let movieService: MovieService;
  let movieRepository: Repository<MovieEntity>;
  let createMovieDto: CreateMovieDto = {
    "title": "Inception",
    "description": "A thief who steals corporate secrets through dream-sharing technology is given a chance to have his criminal history erased if he can plant an idea into someone’s subconscious.",
    "releaseYear": 2010,
    "duration": 148,
    "language": "English",
    "contentRating": "PG-13",
    "posterUrl": "https://cdn.example.com/movies/inception-poster.jpg",
    "trailerUrl": "https://cdn.example.com/movies/inception-trailer.mp4",
    "videoUrl": "https://cdn.example.com/movies/inception.mp4",
    "isActive": true
  }

   
  const REPOSITORY_TOKEN = getRepositoryToken(MovieEntity);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovieService,
        {
          provide: REPOSITORY_TOKEN,
          useValue: {

            create: jest.fn((dto: CreateMovieDto) => dto),
            save: jest.fn((dto: CreateMovieDto) => Promise.resolve({ movie_id: 'someId', ...dto })),

            findOneBy: jest.fn(({ movie_id }) => {
              console.log('findOneBy called with movie_id:',movie_id);
              const movie = movies.find(mov => mov.id == parseInt(movie_id));
              return Promise.resolve(movie);
            }),
            findOne: jest.fn(),
            find: jest.fn((options: Options | any) => {

              if (!options?.where || Object.keys(options.where).length === 0) {
                return Promise.resolve(movies);
              }

              let filteredMovies = movies;
              if (options.where.title) {
                // handle TypeORM `Like` operator
                console.log('options.where.title:', options.where.title);
                let titleFilter = options.where.title;
                // { _type: 'like', value: '%Inception%' } is object
                if (typeof titleFilter === 'object' && 'value' in titleFilter) {
                  titleFilter = titleFilter.value.replace(/%/g, '').toLowerCase();
                } else {
                  titleFilter = String(titleFilter).toLowerCase();
                }
                filteredMovies = filteredMovies.filter(movie =>
                  movie.title.toLowerCase().includes(titleFilter),
                );
              }
              return Promise.resolve(filteredMovies);
            }),
            remove: jest.fn((Movie :MovieTestType)=> {
              const index = movies.findIndex(mov => mov.id == Movie.id);
              if (index !== -1) {
                return Promise.resolve(movies.splice(index, 1));
              }
            }),
          },
        }
      ],
    }).compile();

    movieService = module.get<MovieService>(MovieService);
    movieRepository = module.get<Repository<MovieEntity>>(REPOSITORY_TOKEN);
  });

  it('should Movie service be defined', () => {
    expect(movieService).toBeDefined();
  });

  it('should Movie repository be defined', () => {
    expect(movieRepository).toBeDefined();
  });

  describe('create movie', () => {
    it("should 'create' method is called", async () => {
      await movieService.create(createMovieDto);
      expect(movieRepository.create).toHaveBeenCalled();
      expect(movieRepository.create).toHaveBeenCalledTimes(1)
    });

    it("should 'save' method is called", async () => {
      await movieService.create(createMovieDto);
      expect(movieRepository.save).toHaveBeenCalled();
      expect(movieRepository.save).toHaveBeenCalledTimes(1)
    });

    it("should return the created movie", async () => {
      const result = await movieService.create(createMovieDto);
      expect(result).toBeDefined();
      expect(result).toEqual({ movie_id: 'someId', ...createMovieDto });
    });
  });

  describe('find all movies', () => {
    it("should 'find' method is called", async () => {
      await movieService.findAll({});
      expect(movieRepository.find).toHaveBeenCalled();
      expect(movieRepository.find).toHaveBeenCalledTimes(1)
    });

    it("shoud findall return all movies without using query", async () => {
      const arr_mvoies = await movieService.findAll({});
      expect(arr_mvoies.length).toEqual(6);
      expect(arr_mvoies).toBe(movies)
    });

    it("shoud findall return all movies without using query", async () => {
      const filterMovies = await movieService.findAll({ title: 'The Dark Knight' });
      expect(filterMovies.length).toEqual(1);
      expect(filterMovies[0]).toMatchObject(movies[5])
    });
  });

  describe('find movie by id', () => {
    it("should 'findOneBy' method is called", async () => {
      await movieService.findById("1")
      expect(movieRepository.findOneBy).toHaveBeenCalled();
      expect(movieRepository.findOneBy).toHaveBeenCalledTimes(1)
    });

    it("should findOneById return one movie ", async () => {
      const result = await movieService.findById('1')
      expect(result).toBeDefined();
      expect(result).toMatchObject(movies[0])
    });

    it("should findOneById throw exception if id more than 5 ", async () => {
      try {
        await movieService.findById("10");
      }
      catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBe("Movie not Found");
      }
    });
  });

  describe('update movie', () => {
    const updateMovieDto: UpdateMovieDto = {
      title: "Inception Updated",
    };
    it("should 'findOneBy' method is called", async () => {
      await movieService.update("5", updateMovieDto);
      expect(movieRepository.findOneBy).toHaveBeenCalled();
      expect(movieRepository.findOneBy).toHaveBeenCalledTimes(1);
    });

    it("should 'save' method is called", async () => {
      await movieService.update("5", updateMovieDto);
      expect(movieRepository.save).toHaveBeenCalled();
      expect(movieRepository.save).toHaveBeenCalledTimes(1);
    });

    it("should return value when called update", async () => {
      const result = await movieService.update("5", updateMovieDto);
      expect(result).toBeDefined();
      expect(result.title).toBe("Inception Updated");
    });

    it("should throw error exception when id is invalid ", async () => {
      try {
        await movieService.update("20", updateMovieDto);
      }
      catch(error){
        expect(error.message).toBe("Movie not Found");
      }
    });
  });

  describe.skip('remove movie', () => {
    
    it("should 'findOneBy' method is called", async () => {
      await movieService.delete("1");
      expect(movieRepository.findOneBy).toHaveBeenCalled();
      expect(movieRepository.findOneBy).toHaveBeenCalledTimes(1);
    });

    it("should 'save' method is called", async () => {
      await movieService.delete("5");
      expect(movieRepository.remove).toHaveBeenCalled();
      expect(movieRepository.remove).toHaveBeenCalledTimes(1);
    });

    it("should return value when called update", async () => {
      const result = await movieService.delete("3");
      expect(result).toBeDefined();
      expect(result.message).toBe('Movie deleted successfully' );
    });

    it("should throw error exception when id is invalid ", async () => {
      try {
        await movieService.delete("20");
      }
      catch(error){
        expect(error.message).toBe("Movie not Found");
      }
    });
  });
});
