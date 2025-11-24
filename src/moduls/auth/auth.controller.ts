/* eslint-disable prettier/prettier */

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { CreateUserDto } from '../user/dto/create-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private cookieOptions: { [key: string]: any };

  constructor(private readonly authService: AuthService) {
    this.cookieOptions = {
      httpOnly: true, // Cookie not accessible via JavaScript
      secure: false, // Set to true if using HTTPS
      sameSite: 'lax', // CSRF protection
      maxAge: 1000 * 60 * 60, // 1 hour
    };
  }

  /**
   * User Sign In
   *
   * This endpoint authenticates a user based on their email and password.
   * If successful, it issues a JWT token and sets it as an HTTP-only cookie.
   *
   * @param response Express Response object (for setting cookies)
   * @param body Object containing user email and password
   * @returns A message indicating successful login
   */
  @ApiOperation({ summary: 'User Sign In' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'Password123!' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() body: { email: string; password: string },
  ) {
    const token = await this.authService.signIn(body.email, body.password);
    response.cookie('access_token', token, this.cookieOptions);
    return { message: 'Login successful' };
  }

  /**
   * User Sign Up
   *
   * This endpoint registers a new user and automatically signs them in.
   * It returns a success message and sets the JWT token as an HTTP-only cookie.
   *
   * @param response Express Response object (for setting cookies)
   * @param body User registration data (CreateUserDto)
   * @returns A message indicating successful registration
   */
  @ApiOperation({ summary: 'User Sign Up' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 200, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async register(
    @Res({ passthrough: true }) response: Response,
    @Body() body: CreateUserDto,
  ) {
    const token = await this.authService.register(body);
    response.cookie('access_token', token, this.cookieOptions);
    return { message: 'Registration successful' };
  }

  /**
   * User Sign Out
   *
   * Logs out the currently authenticated user by clearing the JWT cookie.
   *
   * @param response Express Response object (for clearing cookies)
   * @returns A message indicating successful logout
   */
  @ApiOperation({ summary: 'User Sign Out' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  public signOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return { message: 'Logout successful' };
  }

  /**
   * Verify Email
   *
   * This endpoint verifies a user's email using a token and email query parameters.
   *
   * @param query Object containing the token and email for verification
   * @returns A message indicating successful email verification
   * @throws BadRequestException if required parameters are missing
   */
  @ApiOperation({ summary: 'Verify user email address' })
  @ApiQuery({
    name: 'token',
    type: String,
    required: true,
    description: 'Email verification token',
  })
  @ApiQuery({
    name: 'email',
    type: String,
    required: true,
    description: 'User email address to verify',
  })
  @ApiResponse({ status: 200, description: 'Email verification successful' })
  @ApiResponse({
    status: 400,
    description: 'Token and email are required for verification',
  })
  @Get('verify-email')
  public async verifyEmail(@Query() query: { token: string; email: string }) {
    if (!query.token || !query.email) {
      throw new BadRequestException(
        'Token and email are required for verification',
      );
    }
    const result = await this.authService.verifyEmail(
      query.token,
      query.email,
    );
    if (result) {
      return { message: 'Email verification successful' };
    }
  }
}
