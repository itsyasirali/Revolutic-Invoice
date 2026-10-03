import type { DataSource } from "typeorm";

/**
 * Rows returned by a raw `UPDATE ... RETURNING`. TypeORM's postgres driver
 * returns `[rows, rowCount]` for UPDATE/DELETE statements but plain `rows`
 * for SELECT, so normalise both shapes.
 */
export const queryRows = async <T = { id: number }>(
  db: DataSource,
  sql: string,
  params: unknown[],
): Promise<T[]> => {
  const res = (await db.query(sql, params)) as unknown;
  if (Array.isArray(res) && res.length === 2 && Array.isArray(res[0]) && typeof res[1] === "number") {
    return res[0] as T[];
  }
  return res as T[];
};
