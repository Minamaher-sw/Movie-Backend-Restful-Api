/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, Matches, IsOptional, IsString, Length} from 'class-validator';
import { SubscriptionType, UserRole } from '../../../utils/enum';

// ===== Regex Patterns =====
const nameRegex = /^[a-zA-Z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[{\]};:'",<.>/?\\|`~]).{8,}$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
const avatarRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i;


export class CreateUserDto {
  @ApiProperty({ example: 'Mina', description: 'First name of the user' })
  @IsString({ message: 'First name must be a string' })
  @Length(3, 30, { message: 'First name must be between 3 and 30 characters' })
  @Matches(nameRegex, { message: 'First name can only contain letters and spaces' })
  firstName: string;

  @ApiProperty({ example: 'Maher', description: 'Last name of the user' })
  @IsString({ message: 'Last name must be a string' })
  @Length(3, 30, { message: 'Last name must be between 3 and 30 characters' })
  @Matches(nameRegex, { message: 'Last name can only contain letters and spaces' })
  lastName: string;

  @ApiProperty({ example: 'mina123', description: 'Unique username for the user' })
  @IsString({ message: 'Username must be a string' })
  @Length(3, 50, { message: 'Username must be between 3 and 50 characters' })
  @Matches(nameRegex, { message: 'Username can only contain letters and spaces' })
  username: string;

  @ApiProperty({ example: 'mina@example.com', description: 'Unique user email' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Matches(emailRegex, { message: 'Email format is invalid' })
  email: string;

  @ApiProperty({ example: 'StrongPass123!', description: 'User password (8–20 chars, mixed case, digit, special char)' })
  @IsString({ message: 'Password must be a string' })
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters' })
  @Matches(passwordRegex, { message: 'Password must contain upper, lower, digit, and special character' })
  password: string;

  @ApiProperty({ example: '+2011148786601', required: false, description: 'User phone number in E.164 format' })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @Matches(phoneRegex, { message: 'Phone number must be in E.164 format (e.g., +201112345678)' })
  phone?: string;

  @ApiProperty({ example: 'https://i.imgur.com/avatar.png', required: false, description: 'Profile image URL' })
  @IsOptional()
  @IsString({ message: 'Avatar URL must be a string' })
  @Matches(avatarRegex, { message: 'Invalid avatar URL format' })
  avatar?: string | null;

  @ApiProperty({ enum: SubscriptionType, default: SubscriptionType.FREE, description: 'Subscription type' })
  @IsOptional()
  @IsEnum(SubscriptionType, { message: 'Subscription type must be FREE, BASIC, or PREMIUM' })
  subscriptionType?: SubscriptionType;

  @ApiProperty({ enum: UserRole, default: UserRole.USER, description: 'User role' })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be USER or ADMIN' })
  role?: UserRole;

  @ApiProperty({ example: 'verification-token-123', description: 'Token used for account verification', required: false })
  @IsOptional()
  @IsString({ message: 'Verification token must be a string' })
  verificationToken?: string |null;
}
