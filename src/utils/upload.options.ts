/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NotFoundException } from "@nestjs/common";
import { diskStorage } from "multer";

export const uploadOptions = {
    storage: diskStorage({
        destination: './images',
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = `${uniqueSuffix}-${file.originalname}`;
            cb(null, filename);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            // Allow storage of file
            cb(null, true);
        } else {
            // Reject file
            cb(new NotFoundException('Unsupported file type'), false);
        }
    },
    limits: { fileSize: 2 * 1024 * 1024, // 2 MB
    },
}