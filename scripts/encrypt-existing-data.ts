// One-off: encrypts legacy plaintext fields in place (idempotent, one transaction).
// Usage: npx tsx --env-file=.env scripts/encrypt-existing-data.ts
import { Client } from "pg";
import { encryptString, isEncrypted } from "@/lib/encryption";

const TEXT: Record<string, string[]> = {
  customers: ["companyName", "displayName", "address", "remarks", "documents"],
  items: ["name", "unit", "description"],
  invoices: ["notes", "recipients"],
  invoice_items: ["title", "description"],
  payments: ["referenceNo", "customerDisplayName", "customerEmail", "notes"],
};
const JSONB: Record<string, string[]> = { customers: ["contacts"] };

const run = async () => {
  const db = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  });
  await db.connect();
  await db.query("BEGIN");
  try {
    for (const table of Object.keys({ ...TEXT, ...JSONB })) {
      const cols = [...(TEXT[table] ?? []), ...(JSONB[table] ?? [])];
      const { rows } = await db.query(
        `SELECT id, ${cols.map((c) => `"${c}"`).join(", ")} FROM "${table}"`,
      );
      let updated = 0;
      for (const row of rows) {
        const sets: string[] = [];
        const vals: unknown[] = [];
        for (const c of TEXT[table] ?? []) {
          if (row[c] == null || isEncrypted(row[c])) continue;
          vals.push(encryptString(String(row[c])));
          sets.push(`"${c}" = $${vals.length}`);
        }
        for (const c of JSONB[table] ?? []) {
          if (row[c] == null || typeof row[c] === "string") continue; // already encrypted
          vals.push(JSON.stringify(encryptString(JSON.stringify(row[c]))));
          sets.push(`"${c}" = $${vals.length}::jsonb`);
        }
        if (!sets.length) continue;
        vals.push(row.id);
        await db.query(`UPDATE "${table}" SET ${sets.join(", ")} WHERE id = $${vals.length}`, vals);
        updated++;
      }
      console.log(`${table}: ${updated}/${rows.length} rows encrypted`);
    }
    await db.query("COMMIT");
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  } finally {
    await db.end();
  }
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
