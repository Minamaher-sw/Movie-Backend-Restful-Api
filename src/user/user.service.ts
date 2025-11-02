/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

  constructor(@InjectRepository(UserEntity) private readonly userRepo:Repository<UserEntity>) {}
  // Create User
  public async create(user: CreateUserDto) {
    const newUser = this.userRepo.create(user);
    return await this.userRepo.save(newUser); ;
  }

  // Get All Users
  public async findAll(): Promise<UserEntity[]> {
    const users = await this.userRepo.find();
    return users;
  }

  // Get One User by ID
  public async findById(user_id: number) : Promise<UserEntity> {
    const user = await this.userRepo.findOne({where:{user_id}})
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }
    return user;
  }

  // Update User by ID
  public async update(user_id: number, updateData: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(user_id);
    Object.assign(user, updateData);
    return await this.userRepo.save(user);
  }

  //  Delete User by ID
  public async remove(user_id: number):Promise<string> {
    const user = await this.findById(user_id);
    await this.userRepo.remove(user);
    return `User ${user_id} deleted successfully`;
  }

  //  Verify User (Optional helper)
  async verifyUser(id: number): Promise<UserEntity> {
    const user = await this.findById(id);
    user.isVerified = true;
    return await this.userRepo.save(user);;
  }
}
