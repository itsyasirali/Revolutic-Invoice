import { getDatabase } from "@/lib/database";
import { CustomPlaceholder } from "@/entities/CustomPlaceholder";
import type { CustomPlaceholderLike } from "./registry";

export const loadCustomPlaceholders = async (
  organizationId: number,
): Promise<CustomPlaceholderLike[]> => {
  const db = await getDatabase();
  const rows = await db
    .getRepository(CustomPlaceholder)
    .find({ where: { organizationId } });
  return rows.map((r) => ({ key: r.key, label: r.label, value: r.value }));
};
