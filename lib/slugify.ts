import type { Repository } from "typeorm";
import type { Organization } from "@/entities/Organization";

export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "org";

/**
 * Generates a slug for `name` that is unique across all organizations,
 * appending -2, -3, ... on collision.
 */
export const generateUniqueSlug = async (
  orgRepo: Repository<Organization>,
  name: string,
): Promise<string> => {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;

  while (await orgRepo.findOne({ where: { slug: candidate } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};
