/**
 * Resolves a stored file reference (Cloudinary HTTPS URL, base64 data URI,
 * or a legacy relative storage path) into a URL that can be used directly
 * in an <a href> or <img src>. Mirrors the convention used for logo URLs
 * (see components/Templates/TemplatePreview.tsx) but also safely handles
 * data: URIs, which must never be prefixed with a leading slash.
 */
export const resolveFileUrl = (value: string | null | undefined): string => {
  if (!value) return "";
  const str = String(value);
  if (/^(https?:|data:|blob:)/i.test(str)) {
    return str;
  }
  return `/${str.replace(/^\//, "")}`;
};
