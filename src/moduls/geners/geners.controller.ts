/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Param,
  Delete,
  Query,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import { GenersService } from './geners.service';
import { AuthRoleGuard } from '../../common/guards/role_guard/auth.role.guard';
import { Role } from '../../common/decrators/user-role/user-role.decorator';
import { UserRole } from '../../utils/enum';
import { CreateGenreDto } from './dto/create.geners.dot';
import { UpdateGenreDto } from './dto/update.geners.dto';
import { GenreEntity } from './entity/genre.entity';

@Controller('genres')
@UseGuards(AuthRoleGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class GenersController {
  constructor(private readonly genersService: GenersService) { }

  @Get()
  @Role(UserRole.ADMIN)
  async getAllGenres(@Query() query: any): Promise<{ success: boolean; message: string; data: GenreEntity[]; total: number; pages: number; currentPage: number }> {
    const data = await this.genersService.findAll(query);
    return {
      success: true,
      message: 'Genres fetched successfully',
      data: data.data,
      total: data.total,
      pages: data.pages,
      currentPage: data.currentPage
    };
  }

  @Get('by-ids')
  @Role(UserRole.ADMIN)
  async getGenresByIds(@Body('ids') ids: string[]): Promise<{ success: boolean; message: string; data: GenreEntity[] }> {
    const data = await this.genersService.findByIds(ids);
    return {
      success: true,
      message: 'Genres fetched successfully',
      data
    };
  }
  
  @Get(':id')
  @Role(UserRole.ADMIN)
  async getGenreById(@Param('id') id: string): Promise<{ success: boolean; message: string; data: GenreEntity }> {
    const data = await this.genersService.findById(id);
    return {
      success: true,
      message: 'Genre fetched successfully',
      data
    };
  }



  @Post()
  @Role(UserRole.ADMIN)
  async createGenre(
    @Body() createGenreDto: CreateGenreDto,
  ): Promise<{ success: boolean; message: string; data: GenreEntity }> {
    const genre = await this.genersService.createGenre(createGenreDto);
    return {
      success: true,
      message: 'Genre created successfully',
      data: genre
    };
  }

  @Patch(':id')
  @Role(UserRole.ADMIN)
  async updateGenre(
    @Param('id') id: string,
    @Body() updateGenreDto: UpdateGenreDto,
  ): Promise<{ success: boolean; message: string; data: GenreEntity }> {
    const genre = await this.genersService.updateGenre(id, updateGenreDto);
    return { success: true, message: 'Genre updated successfully', data: genre };
  }

  @Delete(':id')
  @Role(UserRole.ADMIN)
  async deleteGenre(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.genersService.deleteGenre(id);
    return {
      success: true,
      message: 'Genre deleted successfully'
    };
  }
}
