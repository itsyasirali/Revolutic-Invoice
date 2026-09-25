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
const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder: string,
  fileName?: string,
  resourceType: "image" | "raw" = "image",
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const extMatch = fileName?.match(/\.[^/.]+$/);
    const extension = extMatch ? extMatch[0] : "";
    const baseName = fileName
      ? fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")
      : undefined;
    // "image"/"video" resources get their extension auto-appended by
    // Cloudinary on delivery, but "raw" resources are served byte-for-byte
    // under whatever public_id was given — so the extension must be baked
    // into the public_id itself, or downloads come back with no extension.
    const cleanPublicId = baseName
      ? resourceType === "raw"
        ? `${baseName}-${Date.now()}${extension}`
        : `${baseName}-${Date.now()}`
      : undefined;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `revolutic/${folder}`,
        public_id: cleanPublicId,
        // Non-image files (PDFs, etc.) must go through "raw" — Cloudinary
        // blocks direct delivery of PDFs uploaded/served as "image" by
        // default (a security restriction), which breaks viewing them.
        resource_type: resourceType,
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
  const resourceType = file.type?.startsWith("image/") ? "image" : "raw";
  return uploadBufferToCloudinary(buffer, folder, file.name, resourceType);
};

/**
 * Extracts the public_id from a Cloudinary URL. "raw" resources keep their
 * extension as part of the public_id (Cloudinary doesn't auto-append it on
 * delivery like it does for "image"/"video"), so both forms are returned.
 * e.g. "https://res.cloudinary.com/demo/image/upload/v12345/revolutic/templates/logo-123.png"
 * -> { withExt: "revolutic/templates/logo-123.png", withoutExt: "revolutic/templates/logo-123", isRaw: false }
 */
const extractPublicIdFromUrl = (
  url: string,
): { withExt: string; withoutExt: string; isRaw: boolean } | null => {
  try {
    if (!url || !url.includes("cloudinary.com")) return null;
    const parts = url.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex === -1) return null;

    const isRaw = parts[uploadIndex - 1] === "raw";

    // Skip version tag (e.g. "v1234567") if present
    let publicIdParts = parts.slice(uploadIndex + 1);
    if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
      publicIdParts = publicIdParts.slice(1);
    }

    const withExt = publicIdParts.join("/");
    const withoutExt = withExt.replace(/\.[^/.]+$/, "");
    return { withExt, withoutExt, isRaw };
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

  const extracted = urlOrPublicId.includes("cloudinary.com")
    ? extractPublicIdFromUrl(urlOrPublicId)
    : null;

  // A raw public_id (from a resolved URL) includes its extension; a plain
  // publicId string or an image/video one doesn't.
  const candidates: { publicId: string; resourceType: "image" | "raw" }[] =
    extracted
      ? extracted.isRaw
        ? [
            { publicId: extracted.withExt, resourceType: "raw" },
            { publicId: extracted.withoutExt, resourceType: "raw" },
            { publicId: extracted.withoutExt, resourceType: "image" },
          ]
        : [
            { publicId: extracted.withoutExt, resourceType: "image" },
            { publicId: extracted.withExt, resourceType: "raw" },
          ]
      : [
          { publicId: urlOrPublicId, resourceType: "image" },
          { publicId: urlOrPublicId, resourceType: "raw" },
        ];

  for (const { publicId, resourceType } of candidates) {
    try {
      const res = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      if (res?.result === "ok") return true;
    } catch (error) {
      console.error(
        `[Cloudinary] Failed to delete asset "${publicId}" (${resourceType}):`,
        error,
      );
    }
  }

  return false;
};

export default cloudinary;
