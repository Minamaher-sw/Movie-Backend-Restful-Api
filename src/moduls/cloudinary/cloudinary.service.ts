/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
@Injectable()
export class CloudinaryService {
    async uploadImage(file: Express.Multer.File): Promise<any> {
        // Logic to upload a single image to Cloudinary
        return new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream({
                    folder: 'movie_app',
                    use_filename: true,
                    unique_filename: true,
                    resource_type: 'image',
                    transformation: [
                        { width: 1920, height: 1920, crop: 'limit' },
                        { fetch_format: 'auto', quality: 'auto:best' } 
                    ],
                }, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }).end(file.buffer);
        });
    }

    async deleteImage(publicId: string): Promise<any> {
        return cloudinary.uploader.destroy(publicId);
    }
}   
