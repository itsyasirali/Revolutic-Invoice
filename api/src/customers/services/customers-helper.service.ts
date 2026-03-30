import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CustomersHelperService {
    parseContactsFromBody(body: any): any[] {
        const contactsMap: Record<number, any> = {};
        Object.keys(body).forEach((key) => {
            const matches = key.match(/^contacts\[(\d+)\]\.(.+)$/);
            if (matches) {
                const idx = Number(matches[1]);
                const field = matches[2];
                contactsMap[idx] = contactsMap[idx] || {};
                contactsMap[idx][field] = body[key];
            }
        });
        const contacts = Object.keys(contactsMap)
            .sort((a, b) => Number(a) - Number(b))
            .map((k) => contactsMap[Number(k)]);
        return contacts;
    }

    buildDocumentPaths(files: any[] | undefined): string[] {
        if (!files || !files.length) return [];
        return files.map((f) =>
            path.join('uploads', 'customer', path.basename(f.path)),
        );
    }

    deleteFileIfExists(relativePath: string): void {
        try {
            const absolute = path.resolve(relativePath);
            if (fs.existsSync(absolute)) {
                fs.unlinkSync(absolute);
            }
        } catch (err) {
            console.error('Error deleting file:', relativePath, err);
        }
    }
}
