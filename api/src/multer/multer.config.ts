import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const multerOptions = {
    storage: diskStorage({
        destination: (req, file, cb) => {
            let folder = 'others';
            // Simple heuristic based on URL to determine folder
            if (req.url.includes('templates')) {
                folder = 'templates';
            } else if (req.url.includes('customer')) {
                folder = 'customer';
            } else if (req.url.includes('invoices')) {
                folder = 'invoices';
            }

            const uploadPath = `./uploads/${folder}`;
            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + extname(file.originalname));
        },
    }),
};
