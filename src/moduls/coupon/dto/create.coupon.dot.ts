/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  Max,
  Min,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

/** DTO for creating a new coupon */
export class CreateCouponDto {
  @ApiProperty({
    example: 'WELCOME10',
    description: 'Unique coupon code',
    maxLength: 50,
    required: true,
  })
  @IsString({ message: 'Coupon code must be a string.' })
  @IsNotEmpty({ message: 'Coupon code is required.' })
  @Length(1, 50, {
    message: 'Coupon code length must be between 1 and 50 characters.',
  })
  code: string;

  @ApiProperty({
    example: '10% off for new users',
    description: 'Coupon description (optional)',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string.' })
  @Length(0, 255, { message: 'Description cannot exceed 255 characters.' })
  description?: string;

  @ApiProperty({
    example: 10,
    description: 'Discount percentage (0–100)',
    minimum: 0,
    maximum: 100,
    required: true,
  })
  @IsInt({ message: 'Discount percent must be an integer.' })
  @IsNotEmpty({ message: 'Discount percent is required.' })
  @Min(0, { message: 'Discount percent cannot be less than 0.' })
  @Max(100, { message: 'Discount percent cannot exceed 100.' })
  discount_percent: number;

  @ApiProperty({
    example: '2025-10-01T00:00:00.000Z',
    description: 'Coupon validity start date (ISO 8601 date format)',
    type: Date,
    required: true,
  })
  @Type(() => Date)
  @IsDate({ message: 'Valid from must be a valid date.' })
  @IsNotEmpty({ message: 'Valid from date is required.' })
  valid_from: Date;

  @ApiProperty({
    example: '2026-10-01T00:00:00.000Z',
    description: 'Coupon validity end date (ISO 8601 date format)',
    type: Date,
    required: true,
  })
  @Type(() => Date)
  @IsDate({ message: 'Valid to must be a valid date.' })
  @IsNotEmpty({ message: 'Valid to date is required.' })
  valid_to: Date;

  @ApiProperty({
    example: true,
    description: 'Is the coupon active?',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean value.' })
  is_active?: boolean;
}
