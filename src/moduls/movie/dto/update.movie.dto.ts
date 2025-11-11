/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/swagger';

import { CreateMovieDto } from './create.movie.dot';

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
