import path from "path";
import { uploadFileToCloudinary } from "./cloudinary";

export interface SavedUpload {
  filename: string;
  folder: string;
  /** Cloudinary HTTPS URL (or fallback path). */
  relativePath: string;
}

const resolveFolder = (requestUrl: string): string => {
  if (requestUrl.includes("templates")) return "templates";
  if (requestUrl.includes("customer")) return "customers";
  if (requestUrl.includes("invoices")) return "invoices";
  return "others";
};

/**
 * Splits multipart FormData into string fields + File instances for a given field name.
 */
export const extractFormFields = (
  formData: FormData,
  fileFieldName: string,
): { fields: Record<string, string>; files: File[] } => {
  const fields: Record<string, string> = {};
  const files: File[] = [];

  for (const [key, value] of formData.entries()) {
    if (key === fileFieldName && value instanceof File) {
      if (value.size > 0 && value.name && value.name.trim().length > 0) {
        files.push(value);
      }
    } else if (typeof value === "string") {
      fields[key] = value;
    }
  }

  return { fields, files };
};

/**
 * Uploads a single uploaded File directly to Cloudinary.
 * Compatible with Vercel serverless environments.
 */
export const saveUploadedFile = async (
  file: File,
  requestUrl: string,
): Promise<SavedUpload | null> => {
  if (!file || !file.name || file.size === 0) {
    return null;
  }

  const folder = resolveFolder(requestUrl);

  try {
    const isCloudinaryConfigured =
      Boolean(process.env.CLOUDINARY_URL) ||
      Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET,
      );

    if (isCloudinaryConfigured) {
      const result = await uploadFileToCloudinary(file, folder);
      return {
        filename: file.name,
        folder,
        relativePath: result.url, // Full Cloudinary HTTPS URL
      };
    }

    // Dev fallback if Cloudinary credentials are not yet added to .env
    console.warn(
      "[Upload] Cloudinary credentials not detected in environment variables. Falling back to data URI for development.",
    );
    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "application/octet-stream";
    const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    return {
      filename: file.name,
      folder,
      relativePath: dataUrl,
    };
  } catch (error) {
    console.error("[Upload] Error saving uploaded file to Cloudinary:", error);
    return null;
  }
};
