/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';
import { cloudinaryProvider } from '../../config/cloudinary/cloudinary.config';


@Module({
  controllers: [CloudinaryController],
  providers: [CloudinaryService , cloudinaryProvider],
  exports:[cloudinaryProvider]
})
export class CloudinaryModule {}
