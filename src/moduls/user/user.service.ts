/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayloadType } from '../../utils/types';
import { SubscriptionType, UserRole } from '../../utils/enum';
import { AuthProvider } from './auth.provider';
import { join } from 'node:path';
import { unlinkSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
@Injectable()
export class UserService {

  constructor(@InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>, private readonly authProvider: AuthProvider) { }

  // Register or Signup User
  public async register(user: CreateUserDto): Promise<{ userId: string; email: string, role: string }> {
    return await this.authProvider.register(user);
  }

  public async login(email: string, password: string): Promise<{ userId: string; email: string; role: string }> {
    return await this.authProvider.login(email, password);
  }

  // Create User
  public async create(user: CreateUserDto) {
    const { email, password } = user;
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new NotFoundException(`User with email ${email} already exists`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const verificationToken = randomBytes(32).toString('hex');
    const newUser = this.userRepo.create({ ...user, password: hashPassword, verificationToken });
    return await this.userRepo.save(newUser);
  }

  // Get All Users
  public async findAll(query: any): Promise<{ data: UserEntity[]; total: number }> {
    const filters: any = {
      ...(query?.firstName ? { firstName: query.firstName } : {}),
      ...(query?.lastName ? { lastName: query.lastName } : {}),
      ...(query?.email ? { email: Like(`%${query.email}%`) } : {}),
      ...(query?.role ? { role: query.role } : {}),
      ...(query?.isVerified !== undefined ? { isVerified: query.isVerified } : {}),
      ...(query?.subscriptionType !== undefined ? { subscriptionType: query.subscriptionType } : {}),

    };
    const sort: any = {
      ...(query?.sortBy ? { [query.sortBy]: query.sortOrder === 'DESC' ? 'DESC' : 'ASC' } : { user_id: 'ASC' }),
    }
    const skipPage: number | undefined = query?.page && query?.limit ? (query.page - 1) * query.limit : undefined;
    const numUserPerPage: number | undefined = query?.limit ? query.limit : undefined;
    const [users, total] = await this.userRepo.findAndCount({
      where: filters,
      order: sort,
      skip: skipPage,
      take: numUserPerPage,
    });
    return { data: users, total };
  }

  // Get One User by ID
  public async findById(user_id: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { user_id } })
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }
    return user;
  }

  // Update User by ID
  public async update(user_id: string, updateData: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(user_id);
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    Object.assign(user, updateData);
    return await this.userRepo.save(user);
  }

  //  Delete User by ID
  public async remove(user_id: string, payload: JwtPayloadType): Promise<string> {

    if (payload.role !== UserRole.ADMIN && String(payload.userId) !== user_id) {
      throw new NotFoundException(`You do not have permission to delete this user`);
    }
    const user = await this.findById(user_id);

    await this.userRepo.remove(user);
    return `User ${user_id} deleted successfully`;
  }

  //  Verify User (Optional helper)
  async verifyUser(id: string): Promise<UserEntity> {
    const user = await this.findById(id);
    user.isVerified = true;
    return await this.userRepo.save(user);
  }

  /** Get User by Email (Optional helper) */
  public async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  /**
   * getCurrentUser
   * @description Additional methods related to user management can be added here
   * @param user_id number
   * @returns UserEntity
   */

  public async getCurrentUser(user_id: string): Promise<UserEntity> {
    const user = await this.findById(user_id);
    return user;
  }

  // set profile image 
  public async setProfileImage(user_id: string, newProfileImage: string): Promise<UserEntity> {
    const user = await this.getCurrentUser(user_id);
    if (!user) throw new NotFoundException('User not found');

    console.log('Current avatar:', user.avatar);
    if (user.avatar === null) {
      user.avatar = newProfileImage;
    }
    else {
      await this.removeProfileImage(user_id);
      user.avatar = newProfileImage;
    }
    return await this.userRepo.save(user);
  }

  // remove profile image 
  public async removeProfileImage(user_id: string): Promise<UserEntity> {
    const user = await this.getCurrentUser(user_id);
    if (!user.avatar || user.avatar === null) throw new NotFoundException('User does not have a profile image');

    const imgPath = join(process.cwd(), 'images', user.avatar);
    unlinkSync(imgPath);
    user.avatar = null;
    return await this.userRepo.save(user);
  }

  public async updateUserSubscriptionType(userId: string, subscriptionType: SubscriptionType): Promise<UserEntity> {
    const user = await this.findById(userId);
    user.subscriptionType = subscriptionType;
    return await this.userRepo.save(user);
  }
}
