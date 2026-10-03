import type { DataSource } from "typeorm";

/**
 * When an invoice is deleted, anything that was billed through it becomes
 * billable again and a converted quote goes back to Accepted.
 */
export const releaseInvoiceSourceLinks = async (
  db: DataSource,
  invoiceId: number,
  orgId: number,
) => {
  await db.query(
    `UPDATE "expenses" SET "invoiced" = false, "invoiceId" = NULL,
       "status" = CASE WHEN "billable" THEN 'Unbilled' ELSE 'Non-Billable' END
     WHERE "invoiceId" = $1 AND "organizationId" = $2`,
    [invoiceId, orgId],
  );
  await db.query(
    `UPDATE "time_entries" SET "invoiced" = false, "invoiceId" = NULL,
       "status" = CASE WHEN "billable" THEN 'Unbilled' ELSE 'Non-Billable' END
     WHERE "invoiceId" = $1 AND "organizationId" = $2`,
    [invoiceId, orgId],
  );
  await db.query(
    `UPDATE "projects" SET "fixedInvoiceId" = NULL
     WHERE "fixedInvoiceId" = $1 AND "organizationId" = $2`,
    [invoiceId, orgId],
  );
  await db.query(
    `UPDATE "quotes" SET "convertedInvoiceId" = NULL, "status" = 'Accepted'
     WHERE "convertedInvoiceId" = $1 AND "organizationId" = $2`,
    [invoiceId, orgId],
  );
};
