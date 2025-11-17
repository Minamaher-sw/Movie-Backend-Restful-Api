/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MovieTestType } from './movie.service.spec';
import { MovieQueryDto } from './dto/movie.query.dto';

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
describe('MovieController', () => {
  let controller: MovieController;
  let service: MovieService;

  let createMovieDto : MovieTestType ;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        {
          provide: MovieService,
          useValue: {
            create : jest.fn((body :MovieTestType)=> Promise.resolve(body)),
            update : jest.fn((id: string, body :MovieTestType)=> Promise.resolve({ ...body, id: parseInt(id)})),
            findAll : jest.fn((query :MovieQueryDto)=> 
            {
              if(Object.keys(query).length === 0)
              {
                return Promise.resolve(movies);
              }
              else {
                return Promise.resolve([movies[0],movies[1]])
              }
            }
            ),
            findById : jest.fn((id: string)=> movies.find(movie => movie.id === parseInt(id))),
          }
        },
        {
          provide: ConfigService,
          useValue: {}
        },
        {
          provide: JwtService,
          useValue: {}
        }
      ]
    }).compile();

    controller = module.get<MovieController>(MovieController);
    service = module.get<MovieService>(MovieService);
  });

  it('movie controller should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('movie service should be defined', () => {
    expect(service).toBeDefined();
  });

  
  describe("createMovie", () => {
     createMovieDto =  {
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
    }})

    it("should call create method", async () => {
      await controller.createMovie(createMovieDto);
      expect(service.create).toHaveBeenCalled();
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(createMovieDto);
    });

    it("should return object from create method", async () => {
      const result = await controller.createMovie(createMovieDto);
      expect(result).toBeDefined();
      expect(result.movie).toBe(createMovieDto);
      expect(result).toMatchObject({
        success: true,
        message: 'Movie created successfully',
        movie: createMovieDto,
      });
    });

  describe("updateMovie", () => {
    createMovieDto =  {
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
    }
    it("should call update method", async () => {
      await controller.updateMovie("1", createMovieDto);
      expect(service.update).toHaveBeenCalled();
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith("1", createMovieDto);
    });

    it("should return object from update method", async () => {
      const result = await controller.updateMovie("1", createMovieDto);
      expect(result).toBeDefined();
      expect(result.movie?.id).toBeDefined();
      expect(result).toMatchObject({
        success: true,
        message: 'Movie updated successfully',
        movie: { ...createMovieDto, id: 1 },
      });
    });
  });
  describe("getAllMovies", () => {
    it("should call findAll method", async () => {
      await controller.getAllMovies({});
      expect(service.findAll).toHaveBeenCalled();
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it("should return array of movies from findAll method", async () => {
      const result = await controller.getAllMovies({});
      expect(result).toBeDefined();
      expect(result.movies).toBeDefined();
      expect(Array.isArray(result.movies)).toBe(true);
      expect(result.movies.length).toBe(6);
    });

    it("should return filter array of movies from findAll method when use query", async () => {
      const result = await controller.getAllMovies({ title: 'Inception' });
      expect(result).toBeDefined();
      expect(result.movies).toBeDefined();
      expect(Array.isArray(result.movies)).toBe(true);
      expect(result.movies.length).toBe(2);
    });
  });

  describe("find movie by id ", () => {

    it("should call findById method", async () => {
      await controller.getMovieById("1");
      expect(service.findById).toHaveBeenCalled();
      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(service.findById).toHaveBeenCalledWith("1");
    });

    it("should return movie object from findById method", async () => {
      const result = await controller.getMovieById("2");
      expect(result).toBeDefined();
      expect(result.movie).toBeDefined();
      expect(result.movie?.id).toBe(2);
      expect(result).toMatchObject({
        success: true,
        message: 'Movie fetched successfully',
        movie: movies[1],
    });
    });
  });

  describe("deleteMovie", () => {
    it("should call findById  method", async () => {
      await controller.deleteMovie("2");
      expect(service.findById).toHaveBeenCalled();
      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(service.findById).toHaveBeenCalledWith("2");
    });
    it("should call update  method", async () => {
      await controller.deleteMovie("3");
      expect(service.update).toHaveBeenCalled();
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith("3" ,movies[2]={...movies[2], isActive : false});
    });

    it("should return object from deleteMovie method", async () => {
      const result = await controller.deleteMovie("2");
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        success: true,
        message: 'Movie deleted successfully (soft delete)',
        movie : result.movie
      });
    });
  });
});
