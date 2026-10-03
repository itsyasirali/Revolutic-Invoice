import type { DataSource } from "typeorm";
import { HttpError } from "@/lib/requestContext";
import { queryRows } from "@/lib/services/sqlRows";
import { Organization } from "@/entities/Organization";
import { resolvePortalSettings, type PortalSettings } from "@/types/portal";

/** True when the organization requires customer approval before billing project time. */
export const timeApprovalRequired = async (db: DataSource, orgId: number) => {
  const org = await db.getRepository(Organization).findOne({ where: { id: orgId } });
  return resolvePortalSettings(org?.portalSettings as Partial<PortalSettings> | null)
    .requireTimeApproval;
};

export type BillableTable = "expenses" | "time_entries";

/**
 * Atomically marks billable, not-yet-invoiced rows as invoiced and returns the
 * ids actually claimed. Because the check and the update are one statement,
 * two concurrent conversions can never bill the same row twice.
 */
export const claimBillable = async (
  db: DataSource,
  table: BillableTable,
  orgId: number,
  ids: number[],
): Promise<number[]> => {
  const rows = await queryRows(
    db,
    `UPDATE "${table}" SET "invoiced" = true
     WHERE "id" = ANY($1::int[]) AND "organizationId" = $2
       AND "billable" = true AND "invoiced" = false
     RETURNING "id"`,
    [ids, orgId],
  );
  return rows.map((r) => r.id);
};

export const releaseClaim = async (
  db: DataSource,
  table: BillableTable,
  ids: number[],
) => {
  if (ids.length === 0) return;
  await db.query(
    `UPDATE "${table}" SET "invoiced" = false, "invoiceId" = NULL
     WHERE "id" = ANY($1::int[])`,
    [ids],
  );
};

export const linkToInvoice = async (
  db: DataSource,
  table: BillableTable,
  ids: number[],
  invoiceId: number,
) => {
  await db.query(
    `UPDATE "${table}" SET "invoiceId" = $1, "status" = 'Invoiced', "invoiced" = true
     WHERE "id" = ANY($2::int[])`,
    [invoiceId, ids],
  );
};

export const parseIds = (value: unknown): number[] => {
  const ids = (Array.isArray(value) ? value : [])
    .map((v) => parseInt(String(v)))
    .filter((v) => !isNaN(v));
  return Array.from(new Set(ids));
};

/** Claims every requested row or none; throws 409 when any is unavailable. */
export const claimAllOrFail = async (
  db: DataSource,
  table: BillableTable,
  orgId: number,
  ids: number[],
  label: string,
) => {
  if (ids.length === 0) throw new HttpError(`No ${label} selected`, 400);
  const claimed = await claimBillable(db, table, orgId, ids);
  if (claimed.length !== ids.length) {
    await releaseClaim(db, table, claimed);
    throw new HttpError(
      `Some selected ${label} are not billable, were not found, or are already invoiced`,
      409,
    );
  }
  return claimed;
};
