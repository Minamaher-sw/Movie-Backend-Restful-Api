/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CURRENT_USER_kEY } from '../../../utils/constants';
import { AccessTokenType, JwtPayloadType } from '../../../utils/types';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token: AccessTokenType = request.cookies?.['access_token'] || request.headers['authorization'];
    console.log('Token from AuthGuard:', token);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      const payload: JwtPayloadType = await this.jwtService.verifyAsync<JwtPayloadType>(token.access_token, {
        secret: this.configService.get<string>('JWT_SECRET')
      });
      request[CURRENT_USER_kEY] = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token ' + error.message);
    }
    return true;
  }
}
