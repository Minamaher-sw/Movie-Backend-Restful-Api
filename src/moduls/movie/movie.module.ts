/* eslint-disable prettier/prettier */
import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MovieEntity } from './entity/movie.entity';
import { loggerMiddleware } from '../../common/middleware/logger.middleware';
import { GenersModule } from '../geners/geners.module';
import { MoviePeopleModule } from '../movie-people/movie-people.module';

@Module({
  controllers: [MovieController],
  providers: [MovieService],
  imports: [TypeOrmModule.forFeature([MovieEntity]) , JwtModule,GenersModule,
  forwardRef(() => MoviePeopleModule)
],
  exports:[MovieService]
})
export class MovieModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(loggerMiddleware).forRoutes({
      path:"api/v1/movies",
      method: RequestMethod.GET
    });
  }
 }