/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { MoviePeopleService } from './movie-people.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssignPersonToMovieDto } from './dto/assign-movie-people.dto';
import { Role } from '../../common/decrators/user-role/user-role.decorator';
import { PeopleRole, UserRole } from '../../utils/enum';
import { AuthRoleGuard } from '../../common/guards/role_guard/auth.role.guard';
import { RemovePersonFromMovieDto } from './dto/remove-movie-person.dto';
import { UpdateMoviePeopleDto } from './dto/update-movie-people.dto';
import { MoviePeopleResponseDto } from './dto/movie-people-response.dto';
import { PeopleResponseDto } from '../people/dto/people-response.dto';

@ApiTags("Movie-People")
@Controller('movie-people')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(AuthRoleGuard)
export class MoviePeopleController {
    constructor(private readonly moviePeopleService: MoviePeopleService) { }

    @Post("assign")
    @Role(UserRole.ADMIN)
    @ApiOperation({ summary: "Assign person to movie with a role" })
    @ApiBody({ type: AssignPersonToMovieDto })
    @ApiResponse({ status: 201, description: "Person assigned to movie successfully." })
    async assignPersonToMovie(
        @Body() dto: AssignPersonToMovieDto
    ): Promise<{ success: boolean; message: string; data: MoviePeopleResponseDto }> {
        const result = await this.moviePeopleService.assignPersonToMovie(dto);
        return {
            success: true,
            message: "Person assigned to movie successfully",
            data: result,
        };
    }

    @Patch("update-role")
    @Role(UserRole.ADMIN)
    @ApiOperation({ summary: "Update the role of a person in a movie" })
    @ApiBody({ type: UpdateMoviePeopleDto })
    async updateRole(@Body() dto: UpdateMoviePeopleDto): Promise<{ success: boolean; message: string; data: MoviePeopleResponseDto }> {
        const data = await this.moviePeopleService.updatePersonRole(dto);
        return { success: true, message: "Role updated successfully", data };
    }

    @Delete("remove")
    @ApiOperation({ summary: "Remove person from movie" })
    @ApiBody({ type: RemovePersonFromMovieDto })
    async remove(@Body() dto: RemovePersonFromMovieDto): Promise<{ success: boolean; message: string }> {
        await this.moviePeopleService.removePersonFromMovie(dto);
        return { success: true, message: "Person removed from movie" };
    }

    /**
     * Get all people in a movie by role
     * @param movie_id  UUID of the movie
     * @param role Role of the people to filter by
     * @returns List of people with the specified role in the movie 
     */
    @Get(":movie_id/role/:role")
    @Role(UserRole.ADMIN)
    @ApiOperation({ summary: "Get all people in a movie by role" })
    async getByRole(
        @Param("movie_id") movie_id: string,
        @Param("role") role: PeopleRole
    ): Promise<{ success: boolean; message: string; data: PeopleResponseDto[] }> {
        const data = await this.moviePeopleService.getPeopleByMovieAndRole(movie_id, role);
        return { success: true, message: "People retrieved successfully", data };
    }

    @Get(":movie_id")
    @Role(UserRole.ADMIN)
    @ApiOperation({ summary: "Get all people assigned to a movie" })
    async getAll(@Param("movie_id") movie_id: string): Promise<{ success: boolean; message: string; data: MoviePeopleResponseDto[] }> {
        const data = await this.moviePeopleService.getAllPeopleInMovie(movie_id);
        return { success: true, message: "People retrieved successfully", data };
    }

    @Get("person/:person_id")
    @Role(UserRole.ADMIN)
    @ApiOperation({ summary: "Get all movies a person is participating in" })
    async getMoviesByPerson(@Param("person_id") person_id: string): Promise<{ success: boolean; message: string; data: MoviePeopleResponseDto[] }> {
        const data = await this.moviePeopleService.getMoviesByPerson(person_id);
        return { success: true, message: "Movies retrieved successfully", data };
    }
}
