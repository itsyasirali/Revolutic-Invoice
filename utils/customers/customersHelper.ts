import fs from "fs";
import path from "path";
import { Contact } from "@/types/customer";
import { SavedUpload } from "@/lib/upload";

export const parseContactsFromBody = (
  body: Record<string, unknown>,
): Contact[] => {
  const contactsMap: Record<number, Contact> = {};
  Object.keys(body).forEach((key) => {
    const matches = key.match(/^contacts\[(\d+)\]\.(.+)$/);
    if (matches) {
      const idx = Number(matches[1]);
      const field = matches[2] as keyof Contact;
      contactsMap[idx] = contactsMap[idx] || {};
      (contactsMap[idx] as Record<string, unknown>)[field] = body[key];
    }
  });
  return Object.keys(contactsMap)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => contactsMap[Number(k)]);
};

export const buildDocumentPaths = (savedFiles: SavedUpload[]): string[] => {
  if (!savedFiles || !savedFiles.length) return [];
  return savedFiles.map((f) => f.relativePath);
};

export const deleteFileIfExists = (relativePath: string): void => {
  try {
    const absolute = path.resolve(relativePath);
    if (fs.existsSync(absolute)) {
      fs.unlinkSync(absolute);
    }
  } catch (err) {
    console.error("Error deleting file:", relativePath, err);
  }
};
