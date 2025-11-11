/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */

import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    console.log(metadata);
    const oneKb = 1000 * 200; // 200 KB
    if (value.size > oneKb) {
      throw new BadRequestException('File size exceeds 200KB');
    }

    if(!value.mimetype.startsWith('image/')) {
      throw new BadRequestException('Invalid file type. Only image files are allowed.');
    }
    if(!value.originalname.match(/\.(jpg|png|gif)$/)) {
      throw new BadRequestException('Invalid file extension. Only .jpg, .jpeg, .png, .gif are allowed.');
    }
    return value;
  }
}
