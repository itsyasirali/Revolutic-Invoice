import fs from "fs";
import os from "os";
import path from "path";
import { Contact } from "@/types/customer";
import { SavedUpload } from "@/lib/upload";

export const parseContactsFromBody = (
  body: Record<string, unknown>,
): Contact[] => {
  // If contacts were supplied as a JSON-encoded string or already an array
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
    .map((f) => f.relativePath.replace(/\\/g, "/"));
};

export const deleteFileIfExists = (relativePath: string): void => {
  if (!relativePath) return;

  const tryDelete = (fullPath: string) => {
    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.warn(`[Upload] Could not delete file at ${fullPath}:`, err);
    }
  };

  // Try in process.cwd() first
  tryDelete(path.resolve(relativePath));
  // Also try in os.tmpdir() for serverless files
  tryDelete(path.join(os.tmpdir(), relativePath));
};

