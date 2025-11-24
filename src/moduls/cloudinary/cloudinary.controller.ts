/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { uplaodImageDto } from '../upload/dto/upload-image.dto';

@ApiTags('Cloudinary Image Upload')
@Controller('cloudinary/upload')
export class CloudinaryController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @ApiOperation({ summary: 'Upload a single image file' })
    @ApiResponse({
        status: 200,
        description: 'url and public_id of uploaded image',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        type: uplaodImageDto,
        description: 'Upload an image file'
    })
    @Post("single_image")
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        const result = await this.cloudinaryService.uploadImage(file);
        return { url: result.secure_url, public_id: result.public_id };
    }
}
