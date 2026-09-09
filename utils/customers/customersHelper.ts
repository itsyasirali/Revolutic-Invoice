import fs from "fs";
import os from "os";
import path from "path";
import { Contact } from "@/types/customer";
import { SavedUpload } from "@/lib/upload";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";

export const parseContactsFromBody = (
  body: Record<string, unknown>,
): Contact[] => {
  if (body.contacts) {
    if (Array.isArray(body.contacts)) {
      return body.contacts as Contact[];
    }
    if (typeof body.contacts === "string" && body.contacts.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(body.contacts);
        if (Array.isArray(parsed)) return parsed as Contact[];
      } catch {
        // Fallback to key-by-key parsing below
      }
    }
  }

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

export const buildDocumentPaths = (
  savedFiles: (SavedUpload | null | undefined)[],
): string[] => {
  if (!savedFiles || !savedFiles.length) return [];
  return savedFiles
    .filter((f): f is SavedUpload => Boolean(f && f.relativePath))
    .map((f) => f.relativePath);
};

export const deleteFileIfExists = async (fileUrlOrPath: string): Promise<void> => {
  if (!fileUrlOrPath) return;

  // Cloudinary asset deletion
  if (fileUrlOrPath.includes("cloudinary.com")) {
    try {
      await deleteCloudinaryAsset(fileUrlOrPath);
      return;
    } catch (err) {
      console.warn(`[Upload] Could not delete Cloudinary asset at ${fileUrlOrPath}:`, err);
      return;
    }
  }

  // Data URI does not require deletion
  if (fileUrlOrPath.startsWith("data:")) {
    return;
  }

  // Legacy local disk file fallback
  const tryDelete = (fullPath: string) => {
    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.warn(`[Upload] Could not delete file at ${fullPath}:`, err);
    }
  };

  tryDelete(path.resolve(fileUrlOrPath));
  tryDelete(path.join(os.tmpdir(), fileUrlOrPath));
};
