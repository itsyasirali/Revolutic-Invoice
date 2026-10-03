import type { DataSource } from "typeorm";
import { queryRows } from "@/lib/services/sqlRows";

export interface ProjectStats {
  loggedMinutes: number;
  billableMinutes: number;
  nonBillableMinutes: number;
  /** Billable time that has not been invoiced yet. */
  unbilledTimeAmount: number;
  invoicedTimeAmount: number;
  expenseTotal: number;
  unbilledExpenseAmount: number;
  invoicedExpenseAmount: number;
}

export const emptyStats = (): ProjectStats => ({
  loggedMinutes: 0,
  billableMinutes: 0,
  nonBillableMinutes: 0,
  unbilledTimeAmount: 0,
  invoicedTimeAmount: 0,
  expenseTotal: 0,
  unbilledExpenseAmount: 0,
  invoicedExpenseAmount: 0,
});

/** Aggregates time and expenses per project for one organization. */
export const loadProjectStats = async (
  db: DataSource,
  orgId: number,
  projectIds?: number[],
): Promise<Map<number, ProjectStats>> => {
  const filter = projectIds ? `AND "projectId" = ANY($2::int[])` : `AND "projectId" IS NOT NULL`;
  const params: unknown[] = projectIds ? [orgId, projectIds] : [orgId];

  const time = await queryRows<Record<string, string | number>>(
    db,
    `SELECT "projectId",
        COALESCE(SUM("duration"), 0) AS logged,
        COALESCE(SUM("duration") FILTER (WHERE "billable"), 0) AS billable,
        COALESCE(SUM("duration") FILTER (WHERE NOT "billable"), 0) AS nonbillable,
        COALESCE(SUM("amount") FILTER (WHERE "billable" AND NOT "invoiced"), 0) AS unbilled,
        COALESCE(SUM("amount") FILTER (WHERE "invoiced"), 0) AS invoiced
     FROM "time_entries" WHERE "organizationId" = $1 ${filter} GROUP BY "projectId"`,
    params,
  );
  const expenses = await queryRows<Record<string, string | number>>(
    db,
    `SELECT "projectId",
        COALESCE(SUM("total"), 0) AS total,
        COALESCE(SUM("total") FILTER (WHERE "billable" AND NOT "invoiced"), 0) AS unbilled,
        COALESCE(SUM("total") FILTER (WHERE "invoiced"), 0) AS invoiced
     FROM "expenses" WHERE "organizationId" = $1 ${filter} GROUP BY "projectId"`,
    params,
  );

  const stats = new Map<number, ProjectStats>();
  const get = (id: number) => {
    if (!stats.has(id)) stats.set(id, emptyStats());
    return stats.get(id)!;
  };
  for (const r of time) {
    const s = get(Number(r.projectId));
    s.loggedMinutes = Number(r.logged);
    s.billableMinutes = Number(r.billable);
    s.nonBillableMinutes = Number(r.nonbillable);
    s.unbilledTimeAmount = Number(r.unbilled);
    s.invoicedTimeAmount = Number(r.invoiced);
  }
  for (const r of expenses) {
    const s = get(Number(r.projectId));
    s.expenseTotal = Number(r.total);
    s.unbilledExpenseAmount = Number(r.unbilled);
    s.invoicedExpenseAmount = Number(r.invoiced);
  }
  return stats;
};
