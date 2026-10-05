import { getDatabase } from "@/lib/database";
import { Expense } from "@/entities/Expense";
import { TimeEntry } from "@/entities/TimeEntry";
import { Quote } from "@/entities/Quote";
import { expireQuotes } from "@/controllers/quotes/quotePayload";
import type { BusinessInsights } from "@/types/dashboard";

type Convert = (amount: number, source: string, target: string, rates: Record<string, number>) => number;

export interface ExpenseRow {
  date: Date;
  amount: number;
}

export interface InsightsResult {
  insights: BusinessInsights;
  /** Every expense converted to the org currency (feeds the existing expense KPI / charts). */
  expenseRows: ExpenseRow[];
}

const EMPTY: BusinessInsights = {
  expenses: { thisMonth: 0, billable: 0, unbilled: 0 },
  time: { trackedHours: 0, billableHours: 0, unbilledHours: 0, unbilledAmount: 0 },
  quotes: { total: 0, draft: 0, pending: 0, accepted: 0, value: 0 },
};

const hours = (minutes: number) => Math.round((minutes / 60) * 10) / 10;

/** Real expense / time / quote aggregates for the dashboard (all org-scoped, org currency). */
export const getBusinessInsights = async (
  orgId: number,
  orgCurrency: string,
  rates: Record<string, number>,
  convert: Convert,
): Promise<InsightsResult> => {
  try {
    const db = await getDatabase();
    await expireQuotes(db, orgId);

    const [expenses, timeEntries, quotes] = await Promise.all([
      db.getRepository(Expense).find({
        where: { organizationId: orgId },
        select: { id: true, total: true, currency: true, expenseDate: true, billable: true, invoiced: true },
      }),
      db.getRepository(TimeEntry).find({
        where: { organizationId: orgId },
        select: {
          id: true,
          date: true,
          duration: true,
          billable: true,
          invoiced: true,
          amount: true,
          customer: { id: true, currency: true },
        },
        relations: ["customer"],
      }),
      db.getRepository(Quote).find({
        where: { organizationId: orgId },
        select: { id: true, status: true, total: true, currency: true },
      }),
    ]);

    const now = new Date();
    const inThisMonth = (d: Date) =>
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();

    const expenseRows: ExpenseRow[] = [];
    const out: BusinessInsights = JSON.parse(JSON.stringify(EMPTY));

    for (const e of expenses) {
      const amount = convert(Number(e.total) || 0, e.currency || orgCurrency, orgCurrency, rates);
      const date = new Date(e.expenseDate);
      expenseRows.push({ date, amount });
      if (inThisMonth(date)) out.expenses.thisMonth += amount;
      if (e.billable) out.expenses.billable += amount;
      if (e.billable && !e.invoiced) out.expenses.unbilled += amount;
    }

    let unbilledMinutes = 0;
    let trackedMinutes = 0;
    let billableMinutes = 0;
    for (const t of timeEntries) {
      if (inThisMonth(new Date(t.date))) {
        trackedMinutes += t.duration;
        if (t.billable) billableMinutes += t.duration;
      }
      if (t.billable && !t.invoiced) {
        unbilledMinutes += t.duration;
        out.time.unbilledAmount += convert(
          Number(t.amount) || 0,
          t.customer?.currency || orgCurrency,
          orgCurrency,
          rates,
        );
      }
    }
    out.time.trackedHours = hours(trackedMinutes);
    out.time.billableHours = hours(billableMinutes);
    out.time.unbilledHours = hours(unbilledMinutes);

    for (const q of quotes) {
      out.quotes.total += 1;
      if (q.status === "Draft") out.quotes.draft += 1;
      if (q.status === "Sent" || q.status === "Viewed") out.quotes.pending += 1;
      if (q.status === "Accepted") out.quotes.accepted += 1;
      // Open pipeline value: quotes still awaiting an answer or accepted but not yet invoiced.
      if (["Sent", "Viewed", "Accepted"].includes(q.status)) {
        out.quotes.value += convert(
          Number(q.total) || 0,
          q.currency || orgCurrency,
          orgCurrency,
          rates,
        );
      }
    }

    return { insights: out, expenseRows };
  } catch (error) {
    console.error("Error computing business insights:", error);
    return { insights: JSON.parse(JSON.stringify(EMPTY)), expenseRows: [] };
  }
};

export const emptyBusinessInsights = (): BusinessInsights => JSON.parse(JSON.stringify(EMPTY));
