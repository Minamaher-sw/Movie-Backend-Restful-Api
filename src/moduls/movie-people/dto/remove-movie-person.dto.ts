/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class RemovePersonFromMovieDto {
    @ApiProperty({ example: "movie-uuid" })
    @IsUUID()
    movie_id: string;

    @ApiProperty({ example: "person-uuid" })
    @IsUUID()
    person_id: string;
}
