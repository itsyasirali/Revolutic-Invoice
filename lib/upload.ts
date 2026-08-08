import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import path from "path";

export interface SavedUpload {
  filename: string;
  folder: string;
  /** Relative path (e.g. "uploads/templates/xyz.png"), matching the shape the old Multer-based API stored/returned. */
  relativePath: string;
}

// Mirrors api/src/multer/multer.config.ts's destination heuristic: folder is
// picked from a substring match on the request URL, not an explicit param.
const resolveFolder = (requestUrl: string): string => {
  if (requestUrl.includes("templates")) return "templates";
  if (requestUrl.includes("customer")) return "customer";
  if (requestUrl.includes("invoices")) return "invoices";
  return "others";
};

/** Splits a multipart FormData into plain string fields + the Files under one field name — the Route Handler equivalent of what Multer's FilesInterceptor handed controllers as `req.body` + `req.files`. */
export const extractFormFields = (
  formData: FormData,
  fileFieldName: string,
): { fields: Record<string, string>; files: File[] } => {
  const fields: Record<string, string> = {};
  const files: File[] = [];

  for (const [key, value] of formData.entries()) {
    if (key === fileFieldName && value instanceof File) {
      files.push(value);
    } else if (typeof value === "string") {
      fields[key] = value;
    }
  }

  return { fields, files };
};

/** Multer-equivalent disk write for a single uploaded File (Route Handlers use request.formData() instead of Multer's Express req binding). */
export const saveUploadedFile = async (
  file: File,
  requestUrl: string,
): Promise<SavedUpload> => {
  const folder = resolveFolder(requestUrl);
  const uploadDir = path.join(process.cwd(), "uploads", folder);
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `${uniqueSuffix}${path.extname(file.name)}`;
  const filePath = path.join(uploadDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return {
    filename,
    folder,
    relativePath: path.join("uploads", folder, filename),
  };
};
