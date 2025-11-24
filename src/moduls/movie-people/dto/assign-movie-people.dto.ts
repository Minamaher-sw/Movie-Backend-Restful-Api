/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsUUID } from "class-validator";
import { PeopleRole } from "../../../utils/enum";

export class AssignPersonToMovieDto {

    @ApiProperty({ example: "movie-uuid" })
    @IsUUID()
    movie_id: string;

    @ApiProperty({ example: "person-uuid" })
    @IsUUID()
    person_id: string;

    @ApiProperty({ enum: PeopleRole })
    @IsEnum(PeopleRole, { message: 'role must be a valid PeopleRole enum value' })
    role: PeopleRole;
}

export class AssignMultiPersonToMovieDto {

    @ApiProperty({ example: "movie-uuid" })
    @IsUUID()
    movie_id: string;

    @ApiProperty({
        example: [
            { person_id: 'person-uuid-1', role: PeopleRole.DIRECTOR },
            { person_id: 'person-uuid-2', role: PeopleRole.ACTOR },
        ],
        description: 'List of people to assign to the movie along with their roles',
    })
    people: {
        person_id: string;
        role: PeopleRole;
    }[];
}