/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { GenersController } from './geners.controller';
import { GenersService } from './geners.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenreEntity } from './entity/genre.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [GenersController],
  providers: [GenersService],
  imports: [TypeOrmModule.forFeature([GenreEntity]) ,AuthModule ,JwtModule],
  exports: [GenersService],
})
export class GenersModule {}
