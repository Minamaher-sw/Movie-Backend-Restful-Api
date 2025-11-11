/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CURRENT_USER_kEY } from 'src/utils/constants';
import { UserRole } from 'src/utils/enum';
import { AccessTokenType, JwtPayloadType } from 'src/utils/types';

@Injectable()
export class AuthRoleGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService, private readonly reflector: Reflector) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const roles: UserRole[] = this.reflector.get<UserRole[]>('roles', context.getHandler()) || [];
    if (!roles || roles.length === 0) {
      throw new UnauthorizedException('No roles defined for this route');
    }
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
      if (!roles.includes(payload.role as UserRole)) {
        throw new UnauthorizedException('Insufficient role');
      }
      request[CURRENT_USER_kEY] = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token ' + error.message);
    }
    return true;
  }
}
