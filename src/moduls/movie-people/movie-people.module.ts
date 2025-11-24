/* eslint-disable prettier/prettier */
import { forwardRef, Module } from '@nestjs/common';
import { MoviePeopleController } from './movie-people.controller';
import {MoviePeopleService} from "./movie-people.service"
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviePeopleEntity } from './entity/movie_people.entity';
import { MovieModule } from '../movie/movie.module';
import { PeopleModule } from '../people/people.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [MoviePeopleController],
  providers: [MoviePeopleService],
  imports: [TypeOrmModule.forFeature([MoviePeopleEntity]) , 
    forwardRef(() => MovieModule)
   , PeopleModule ,ConfigModule ,JwtModule],
  exports: [MoviePeopleService],
})
export class MoviePeopleModule {}
