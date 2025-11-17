/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AccessTokenType } from '../../utils/types';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

  private async generateToken(payload: { userId: string; email: string; role: string }): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async signIn(
    email: string,
    pass: string,
  ): Promise<AccessTokenType> {
    const payload = await this.usersService.login(email, pass);
    if (!payload) {
      throw new UnauthorizedException("Invalid credentials");
    }
    
    return {
      access_token: await this.generateToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      })
    };
  }

  async register(userData: CreateUserDto): Promise<AccessTokenType> {
    const payload = await this.usersService.register(userData);
    if (!payload) {
      throw new UnauthorizedException("Registration failed");
    }
    const user = await this.usersService.getCurrentUser(payload.userId);
    if(!user) {
      throw new UnauthorizedException("User not found after registration");
    }
    try {
      if(user.verificationToken)
        await this.mailService.sendVerificationEmail(user.email,user.firstName, user.verificationToken);
    } catch (error) {
      console.error('Error sending verification email:', error);
    }

    return {
      access_token: await this.generateToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      })
    };
  }

  public async verifyEmail(token: string, email: string): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.verificationToken) {
      throw new UnauthorizedException("User not found");
    }
    if (user.verificationToken !== token) {
      throw new UnauthorizedException("Invalid verification token");
    }

    await this.usersService.update(user.user_id, { isVerified: true , verificationToken: null });
    return true;
  }
}
