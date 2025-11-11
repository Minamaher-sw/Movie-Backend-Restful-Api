/* eslint-disable prettier/prettier */
import { CreateGenreDto } from "./create.geners.dot";
import { PartialType } from "@nestjs/mapped-types";
export class UpdateGenreDto extends PartialType(CreateGenreDto) {}