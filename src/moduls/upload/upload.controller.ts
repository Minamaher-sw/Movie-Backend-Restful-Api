/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Controller, Get, HttpStatus, NotFoundException, Param, ParseFilePipeBuilder, Post, Res, UploadedFile, UploadedFiles, UseInterceptors, UsePipes } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { FileSizeValidationPipe } from '../../common/File Validation/FileSizeValidationPipe';
import { uploadOptions } from '../../utils/upload.options';
import { uplaodImageDto } from './dto/upload-image.dto';
import { uploadImagesDto } from './dto/upload-images.dto';

@Controller('upload')
@ApiTags('File Upload')
export class UploadController {
    // Upload logic will be implemented here
    @ApiOperation({ summary: 'Upload a single image file' })
    @ApiResponse({
        status: 201,
        description: 'Image file uploaded successfully',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        type: uplaodImageDto,
        description: 'Upload an image file'
    })
    @Post("single_image")
    @UsePipes(new FileSizeValidationPipe())
    @UseInterceptors(FileInterceptor('file', uploadOptions))
    uploadFile(@UploadedFile(
        // new ParseFilePipe({
        //     validators: [
        //         new MaxFileSizeValidator({ maxSize: 200 * 1024 }), // 200 KB
        //         new FileTypeValidator({ fileType: 'image/jpeg' }),
        //     ],
        // }),
        new ParseFilePipeBuilder()
            .addMaxSizeValidator({
                maxSize: 1000 * 1024, // 1000 KB
            })
            // .addFileTypeValidator({
            //     fileType: 'image/jpeg',
            // })
            .build({
                errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
            }),
    ) file: Express.Multer.File) {
        if (!file) {
            throw new NotFoundException('File not uploaded');
        }
        console.log("file is ", file);
        return { message: 'File uploaded successfully', file: file.filename };
    }

    // Upload logic will be implemented here
    @ApiOperation({ summary: 'Upload multiple image files' })
    @ApiResponse({
        status: 201,
        description: 'Images files uploaded successfully',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        type: uploadImagesDto,
        description: 'Upload an images files array'
    })
    @Post("multiple_images")
    @UseInterceptors(FilesInterceptor('files', 3))
    uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
        if (!files || files.length === 0) {
            throw new NotFoundException('Files not uploaded');
        }
        files.forEach(file => {
            console.log("file is ", file);
        });
        return { message: 'Files uploaded successfully', files: files.map(file => file.filename) };
    }

    // acess image 
    @Get(':imagename')
    getImage(@Param('imagename') imageName: string, @Res() res: Response) {
        return res.sendFile(imageName, { root: 'images' });
    }
}
