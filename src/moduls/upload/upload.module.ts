/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { uploadOptions } from '../../utils/upload.options';

@Module({
  controllers: [UploadController],
  imports: [MulterModule.register(uploadOptions)],
})
export class UploadModule {}
