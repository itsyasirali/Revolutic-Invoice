import type { Metadata } from "next";

export const SITE_NAME = "InvoiceSmarty";

/**
 * Metadata for signed-in pages (the app and the customer portal): a title and
 * description for the browser tab / history, and kept out of search engines.
 * The root layout adds the " | InvoiceSmarty" suffix to every title.
 */
export const privateMeta = (title: string, description: string): Metadata => ({
  title,
  description,
  robots: { index: false, follow: false },
});

/** Metadata for public marketing pages, including social-share cards. */
export const publicMeta = (title: string, description: string, path: string, image?: string): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    title: `${title} | ${SITE_NAME}`,
    description,
    url: path,
    siteName: SITE_NAME,
    type: "website",
    ...(image ? { images: [{ url: image }] } : {}),
  },
  twitter: {
    card: image ? "summary_large_image" : "summary",
    title: `${title} | ${SITE_NAME}`,
    description,
    ...(image ? { images: [image] } : {}),
  },
});

/** Metadata for one marketing article (blog post, industry page, customer story). */
export const articleMeta = (
  item: { title: string; description: string; image?: string; date?: string; publishedAt?: string },
  path: string,
): Metadata => {
  const base = publicMeta(item.title, item.description, path, item.image);
  const published = item.publishedAt || item.date;
  return {
    ...base,
    openGraph: { ...base.openGraph, type: "article", ...(published ? { publishedTime: published } : {}) },
  };
};
