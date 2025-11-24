/* eslint-disable prettier/prettier */
import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
    NotFoundException,
    Patch,
} from '@nestjs/common';
import { Role } from '../../common/decrators/user-role/user-role.decorator';
import { AuthRoleGuard } from '../../common/guards/role_guard/auth.role.guard';
import { PeopleService } from './people.service';
import { UserRole } from '../../utils/enum';
import { CreatePeopleDto } from './dto/create-people.dto';
import { UpdatePeopleDto } from './dto/update-people.dto';
import { PeopleResponseDto } from './dto/people-response.dto';
import * as peopleInterfaceQuery from '../../interface/people-interface-query';

// 🔥 Swagger Imports
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';

@ApiTags('People')
@Controller('people')
@UseGuards(AuthRoleGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class PeopleController {
    constructor(private readonly peopleService: PeopleService) {}

    // ================================
    // Create Person
    // ================================
    @Post()
    @Role(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new person' })
    @ApiBody({ type: CreatePeopleDto })
    @ApiResponse({
        status: 201,
        description: 'Person created successfully',
        type: PeopleResponseDto,
    })
    @ApiResponse({ status: 409, description: 'Username already exists' })
    async createPerson(
        @Body() createPeopleDto: CreatePeopleDto,
    ): Promise<{ success: boolean; message: string; data: PeopleResponseDto }> {
        const newPerson = await this.peopleService.createPerson(createPeopleDto);
        return {
            success: true,
            message: 'Person created successfully',
            data: newPerson,
        };
    }

    // ================================
    // 📌 Get All People (Search, Filter, Pagination)
    // ================================
    @Get()
    @Role(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all people with filtering & pagination' })
    @ApiQuery({ name: 'first_name', required: false })
    @ApiQuery({ name: 'last_name', required: false })
    @ApiQuery({ name: 'username', required: false })
    @ApiQuery({ name: 'nationality', required: false })
    @ApiQuery({ name: 'sortBy', required: false })
    @ApiQuery({ name: 'sortOrder', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiResponse({
        status: 200,
        description: 'List of people returned successfully',
        type: PeopleResponseDto,
        isArray: true,
    })
    async getAllPeople(
        @Query() query: peopleInterfaceQuery.PeopleQuery,
    ): Promise<{ success: boolean; message: string; data: PeopleResponseDto[]; total: number; pages: number }> {
        const { data, total, limit } = await this.peopleService.findAll(query);
        return {
            success: true,
            message: 'People fetched successfully',
            data,
            total,
            pages: Math.ceil(total / (limit || 10)),
        };
    }

     // ================================
    // 📌 Get Person By ID
    // ================================
    @Get('person/:person_id')
    @Role(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get a single person by ID' })
    @ApiParam({ name: 'person_id', required: true })
    @ApiResponse({
        status: 200,
        description: 'Person found successfully',
        type: PeopleResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Person not found' })
    async getPersonById(
        @Param('person_id') person_id: string,
    ): Promise<{ success: boolean; message: string; data: PeopleResponseDto }> {
        const person = await this.peopleService.findOneById(person_id);

        if (!person) {
            throw new NotFoundException(`Person with ID ${person_id} not found`);
        }

        return {
            success: true,
            message: 'Person fetched successfully',
            data: person,
        };
    }

    // ================================
    // 📌 Get Person By Username
    // ================================
    @Get(':username')
    @Role(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get a single person by username' })
    @ApiParam({ name: 'username', required: true })
    @ApiResponse({
        status: 200,
        description: 'Person found successfully',
        type: PeopleResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Person not found' })
    async getPersonByUsername(
        @Param('username') username: string,
    ): Promise<{ success: boolean; message: string; data: PeopleResponseDto }> {
        const person = await this.peopleService.findByUsername(username);

        if (!person) {
            throw new NotFoundException(`Person with username ${username} not found`);
        }

        return {
            success: true,
            message: 'Person fetched successfully',
            data: person,
        };
    }


    // ================================
    // 📌 Update Person By ID
    // ================================
    @Patch('person/:person_id')
    @Role(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update a person by ID' })
    @ApiParam({ name: 'person_id', required: true })
    @ApiBody({ type: UpdatePeopleDto })
    @ApiResponse({
        status: 200,
        description: 'Person updated successfully',
        type: PeopleResponseDto,
    })
    async updatePersonById(
        @Param('person_id') person_id: string,
        @Body() updateDto: UpdatePeopleDto,
    ): Promise<{ success: boolean; message: string; data: PeopleResponseDto }> {
        const updatedPerson = await this.peopleService.updatePersonById(person_id, updateDto);
        return {
            success: true,
            message: 'Person updated successfully',
            data: updatedPerson,
        };
    }
    
    // ================================
    // 📌 Update Person By Username
    // ================================
    @Patch(':username')
    @Role(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update a person by username' })
    @ApiParam({ name: 'username', required: true })
    @ApiBody({ type: UpdatePeopleDto })
    @ApiResponse({
        status: 200,
        description: 'Person updated successfully',
        type: PeopleResponseDto,
    })
    async updatePerson(
        @Param('username') username: string,
        @Body() updateDto: UpdatePeopleDto,
    ): Promise<{ success: boolean; message: string; data: PeopleResponseDto }> {
        const updatedPerson = await this.peopleService.updatePersonByUsername(username, updateDto);
        return {
            success: true,
            message: 'Person updated successfully',
            data: updatedPerson,
        };
    }

    
}
