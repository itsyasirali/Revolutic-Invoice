import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configure Cloudinary from environment variables or CLOUDINARY_URL
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true,
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  filename: string;
  bytes: number;
  format: string;
}

/**
 * Uploads a NodeJS Buffer directly to Cloudinary using an upload stream.
 */
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder: string,
  fileName?: string,
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const cleanPublicId = fileName
      ? fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")
      : undefined;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `revolutic/${folder}`,
        public_id: cleanPublicId ? `${cleanPublicId}-${Date.now()}` : undefined,
        resource_type: "auto",
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error("[Cloudinary] Upload error:", error);
          reject(error || new Error("Failed to upload file to Cloudinary"));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            filename: fileName || result.public_id,
            bytes: result.bytes,
            format: result.format,
          });
        }
      },
    );

    stream.end(buffer);
  });
};

/**
 * Uploads a Web API File directly to Cloudinary.
 */
export const uploadFileToCloudinary = async (
  file: File,
  folder: string,
): Promise<CloudinaryUploadResult> => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return uploadBufferToCloudinary(buffer, folder, file.name);
};

/**
 * Extracts the public_id from a Cloudinary URL.
 * e.g. "https://res.cloudinary.com/demo/image/upload/v12345/revolutic/templates/logo-123.png"
 * -> "revolutic/templates/logo-123"
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    if (!url || !url.includes("cloudinary.com")) return null;
    const parts = url.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex === -1) return null;

    // Skip version tag (e.g. "v1234567") if present
    let publicIdParts = parts.slice(uploadIndex + 1);
    if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
      publicIdParts = publicIdParts.slice(1);
    }

    const fullPathWithExt = publicIdParts.join("/");
    // Remove extension
    return fullPathWithExt.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

/**
 * Deletes an asset from Cloudinary using either its publicId or full secure URL.
 */
export const deleteCloudinaryAsset = async (
  urlOrPublicId: string,
): Promise<boolean> => {
  if (!urlOrPublicId) return false;

  const publicId = urlOrPublicId.includes("cloudinary.com")
    ? extractPublicIdFromUrl(urlOrPublicId)
    : urlOrPublicId;

  if (!publicId) return false;

  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    if (res?.result === "ok") return true;

    // If not found in 'image', try 'raw' (PDFs/documents are sometimes classified as 'raw')
    const rawRes = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });
    return rawRes?.result === "ok";
  } catch (error) {
    console.error(`[Cloudinary] Failed to delete asset "${publicId}":`, error);
    return false;
  }
};

export default cloudinary;
