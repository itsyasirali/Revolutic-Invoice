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

/**
 * Turns a resolved file URL into one that forces a real file download
 * (Content-Disposition: attachment) instead of the browser navigating to
 * and rendering it inline (which, for a PDF, opens the browser's PDF
 * viewer and can show a misleading "Failed to load" error on some setups).
 * For Cloudinary URLs this uses the `fl_attachment` delivery flag; other
 * URLs are returned as-is (paired with an <a download> attribute).
 */
export const getDownloadUrl = (value: string | null | undefined): string => {
  const url = resolveFileUrl(value);
  if (!url || !url.includes("res.cloudinary.com")) return url;
  if (url.includes("fl_attachment")) return url;
  return url.replace("/upload/", "/upload/fl_attachment/");
};
