import type { Repository } from "typeorm";
import type { Organization } from "@/entities/Organization";

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "org";

/**
 * Generates the URL slug for `name`. The slug only has to be unique among the
 * owner's own organizations (the active organization comes from the session,
 * not the URL), so two different users can both have "/revolutic/...".
 * A suffix (-2, -3, ...) is added only when the same owner already has that slug.
 */
export const generateUniqueSlug = async (
  orgRepo: Repository<Organization>,
  name: string,
  userId: number,
): Promise<string> => {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;

  while (await orgRepo.findOne({ where: { slug: candidate, userId } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};
