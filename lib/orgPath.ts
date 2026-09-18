export const buildOrgPath = (
  slug: string | null | undefined,
  path: string,
): string => {
  if (!slug || !path.startsWith("/") || path.startsWith(`/${slug}`)) {
    return path;
  }
  return `/${slug}${path}`;
};
