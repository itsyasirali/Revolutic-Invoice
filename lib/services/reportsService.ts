import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { Payment } from "@/entities/Payment";
import { Expense } from "@/entities/Expense";
import { TimeEntry } from "@/entities/TimeEntry";
import { Organization } from "@/entities/Organization";
import { getCurrencySymbol } from "@/data/countries/countries";
import { getCurrencyRates, convertToOrgCurrency } from "@/lib/services/dashboardService";
import { customerLabel } from "@/lib/format";
import type { ReportRange, ReportRangeOption, ReportsData } from "@/types/reports";

export const REPORT_RANGES: ReportRangeOption[] = [
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "this-quarter", label: "This Quarter" },
  { value: "this-year", label: "This Year" },
  { value: "last-12-months", label: "Last 12 Months" },
  { value: "all-time", label: "All Time" },
];

export const parseReportRange = (value?: string | null): ReportRange =>
  REPORT_RANGES.some((r) => r.value === value) ? (value as ReportRange) : "this-year";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MAX_MONTHS = 24;
const DAY = 24 * 60 * 60 * 1000;

const resolveRange = (range: ReportRange, now: Date): { from: Date | null; to: Date } => {
  const y = now.getFullYear();
  const m = now.getMonth();
  const endOfMonth = (yr: number, mo: number) => new Date(yr, mo + 1, 0, 23, 59, 59, 999);
  switch (range) {
    case "this-month":
      return { from: new Date(y, m, 1), to: endOfMonth(y, m) };
    case "last-month":
      return { from: new Date(y, m - 1, 1), to: endOfMonth(y, m - 1) };
    case "this-quarter": {
      const qStart = Math.floor(m / 3) * 3;
      return { from: new Date(y, qStart, 1), to: endOfMonth(y, qStart + 2) };
    }
    case "last-12-months":
      return { from: new Date(y, m - 11, 1), to: endOfMonth(y, m) };
    case "all-time":
      return { from: null, to: endOfMonth(y, m) };
    default:
      return { from: new Date(y, 0, 1), to: new Date(y, 11, 31, 23, 59, 59, 999) };
  }
};

const monthKey = (d: Date) => d.getFullYear() * 12 + d.getMonth();
const monthLabel = (key: number) => {
  const mo = key % 12;
  const yr = Math.floor(key / 12);
  return `${MONTHS[mo]} ${String(yr).slice(2)}`;
};
const round = (n: number) => Math.round(n * 100) / 100;
const rangeLabelOf = (range: ReportRange) =>
  REPORT_RANGES.find((r) => r.value === range)?.label ?? "";

const emptyReports = (symbol: string, range: ReportRange): ReportsData => ({
  currency: symbol,
  range,
  rangeLabel: rangeLabelOf(range),
  summary: {
    invoiced: 0, received: 0, expenses: 0, netProfit: 0,
    outstanding: 0, overdue: 0, invoiceCount: 0, paidCount: 0,
  },
  months: [],
  customers: [],
  aging: [],
  overdueInvoices: [],
  expenseCategories: [],
  time: { totalHours: 0, billableHours: 0, unbilledAmount: 0, byProject: [] },
});

export const getReportsData = async (
  orgId: number | null | undefined,
  range: ReportRange,
): Promise<ReportsData> => {
  if (!orgId) return emptyReports("Rs", range);

  try {
    const db = await getDatabase();
    const org = await db.getRepository(Organization).findOne({ where: { id: orgId } });
    const orgCurrency = (org?.currency || "PKR").toUpperCase().trim();
    const symbol = getCurrencySymbol(orgCurrency);
    const where = { organizationId: orgId };

    const [invoices, payments, expenses, timeEntries, rates] = await Promise.all([
      db.getRepository(Invoice).find({
        where,
        select: {
          id: true, invoiceNumber: true, invoiceDate: true, dueDate: true, total: true,
          received: true, currency: true, status: true, createdAt: true,
          customer: { id: true, displayName: true, companyName: true },
          writeOffs: { id: true, amount: true, reversedAt: true },
        },
        relations: ["customer", "writeOffs"],
      }),
      db.getRepository(Payment).find({
        where,
        select: { id: true, amountReceived: true, currency: true, paymentDate: true, createdAt: true },
      }),
      db.getRepository(Expense).find({
        where,
        select: {
          id: true, total: true, currency: true, expenseDate: true,
          category: { id: true, name: true },
        },
        relations: ["category"],
      }),
      db.getRepository(TimeEntry).find({
        where,
        select: {
          id: true, date: true, duration: true, billable: true, invoiced: true,
          amount: true, project: true,
          projectRef: { id: true, name: true },
          customer: { id: true, currency: true },
        },
        relations: ["projectRef", "customer"],
      }),
      getCurrencyRates(orgCurrency),
    ]);

    const now = new Date();
    const { from, to } = resolveRange(range, now);
    const inRange = (d: Date) => !isNaN(d.getTime()) && (!from || d >= from) && d <= to;
    const conv = (amount: unknown, cur: string | null | undefined) =>
      convertToOrgCurrency(Number(amount) || 0, cur || orgCurrency, orgCurrency, rates);

    const summary = emptyReports(symbol, range).summary;
    const monthMap = new Map<number, { income: number; expenses: number; invoiced: number }>();
    const bucket = (d: Date) => {
      const key = monthKey(d);
      let row = monthMap.get(key);
      if (!row) monthMap.set(key, (row = { income: 0, expenses: 0, invoiced: 0 }));
      return row;
    };

    const customerMap = new Map<
      string,
      { invoices: number; invoiced: number; received: number; outstanding: number }
    >();
    const aging = [
      { label: "Not yet due", count: 0, amount: 0 },
      { label: "1-30 days", count: 0, amount: 0 },
      { label: "31-60 days", count: 0, amount: 0 },
      { label: "61-90 days", count: 0, amount: 0 },
      { label: "90+ days", count: 0, amount: 0 },
    ];
    const overdueInvoices: ReportsData["overdueInvoices"] = [];

    for (const inv of invoices) {
      const status = String(inv.status ?? "").toLowerCase();
      if (status === "draft" || status === "cancelled") continue;
      const invDate = new Date(inv.invoiceDate || inv.createdAt);
      const total = conv(inv.total, inv.currency);
      const name = customerLabel(inv.customer) || "Unknown customer";

      // Sales: invoices dated inside the selected range.
      const counted = inRange(invDate);
      let row: { invoices: number; invoiced: number; received: number; outstanding: number } | undefined;
      if (counted) {
        summary.invoiced += total;
        summary.invoiceCount += 1;
        if (status === "paid") summary.paidCount += 1;
        bucket(invDate).invoiced += total;

        row = customerMap.get(name) ?? { invoices: 0, invoiced: 0, received: 0, outstanding: 0 };
        row.invoices += 1;
        row.invoiced += total;
        row.received += conv(inv.received, inv.currency);
        customerMap.set(name, row);
      }

      // Receivables: a snapshot of everything still owed today, regardless of range.
      if (status === "written off") continue;
      const writtenOff = (inv.writeOffs || []).reduce(
        (sum, w) => sum + (w.reversedAt ? 0 : Number(w.amount || 0)),
        0,
      );
      const remaining = Math.max(0, Number(inv.total || 0) - Number(inv.received || 0) - writtenOff);
      if (remaining <= 0) continue;
      const amount = conv(remaining, inv.currency);
      summary.outstanding += amount;
      if (row) row.outstanding += amount;

      const due = new Date(inv.dueDate || inv.invoiceDate || inv.createdAt);
      const daysOverdue = isNaN(due.getTime()) ? 0 : Math.floor((now.getTime() - due.getTime()) / DAY);
      const idx = daysOverdue <= 0 ? 0 : daysOverdue <= 30 ? 1 : daysOverdue <= 60 ? 2 : daysOverdue <= 90 ? 3 : 4;
      aging[idx].count += 1;
      aging[idx].amount += amount;
      if (daysOverdue > 0) {
        summary.overdue += amount;
        overdueInvoices.push({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerName: name,
          dueDate: due.toISOString(),
          daysOverdue,
          amount: round(amount),
        });
      }
    }

    for (const p of payments) {
      const d = new Date(p.paymentDate || p.createdAt);
      if (!inRange(d)) continue;
      const amount = conv(p.amountReceived, p.currency);
      summary.received += amount;
      bucket(d).income += amount;
    }

    const categoryMap = new Map<string, { count: number; amount: number }>();
    for (const e of expenses) {
      const d = new Date(e.expenseDate);
      if (!inRange(d)) continue;
      const amount = conv(e.total, e.currency);
      summary.expenses += amount;
      bucket(d).expenses += amount;
      const name = e.category?.name || "Uncategorized";
      const row = categoryMap.get(name) ?? { count: 0, amount: 0 };
      row.count += 1;
      row.amount += amount;
      categoryMap.set(name, row);
    }
    summary.netProfit = summary.received - summary.expenses;

    let totalMin = 0;
    let billableMin = 0;
    let unbilledAmount = 0;
    const projectMap = new Map<string, { minutes: number; billable: number; amount: number }>();
    for (const t of timeEntries) {
      const d = new Date(t.date);
      if (!inRange(d)) continue;
      const minutes = Number(t.duration) || 0;
      const amount = t.billable ? conv(t.amount, t.customer?.currency) : 0;
      totalMin += minutes;
      if (t.billable) billableMin += minutes;
      if (t.billable && !t.invoiced) unbilledAmount += amount;
      const name = t.projectRef?.name || t.project || "No project";
      const row = projectMap.get(name) ?? { minutes: 0, billable: 0, amount: 0 };
      row.minutes += minutes;
      if (t.billable) row.billable += minutes;
      row.amount += amount;
      projectMap.set(name, row);
    }
    const hours = (m: number) => Math.round((m / 60) * 10) / 10;

    // Continuous month axis (gaps shown as zero), capped to the latest MAX_MONTHS.
    const keys = Array.from(monthMap.keys());
    const endKey = monthKey(to);
    const startKey = Math.max(
      from ? monthKey(from) : keys.length ? Math.min(...keys) : endKey,
      endKey - (MAX_MONTHS - 1),
    );
    const months: ReportsData["months"] = [];
    for (let k = startKey; k <= endKey; k++) {
      const row = monthMap.get(k) ?? { income: 0, expenses: 0, invoiced: 0 };
      months.push({
        month: monthLabel(k),
        income: round(row.income),
        expenses: round(row.expenses),
        invoiced: round(row.invoiced),
      });
    }

    return {
      currency: symbol,
      range,
      rangeLabel: rangeLabelOf(range),
      summary: Object.fromEntries(
        Object.entries(summary).map(([k, v]) => [k, round(v)]),
      ) as ReportsData["summary"],
      months,
      customers: Array.from(customerMap, ([name, r]) => ({
        name,
        invoices: r.invoices,
        invoiced: round(r.invoiced),
        received: round(r.received),
        outstanding: round(r.outstanding),
      }))
        .sort((a, b) => b.invoiced - a.invoiced)
        .slice(0, 10),
      aging: aging.map((b) => ({ ...b, amount: round(b.amount) })),
      overdueInvoices: overdueInvoices.sort((a, b) => b.daysOverdue - a.daysOverdue).slice(0, 15),
      expenseCategories: Array.from(categoryMap, ([name, r]) => ({
        name,
        count: r.count,
        amount: round(r.amount),
      })).sort((a, b) => b.amount - a.amount),
      time: {
        totalHours: hours(totalMin),
        billableHours: hours(billableMin),
        unbilledAmount: round(unbilledAmount),
        byProject: Array.from(projectMap, ([name, r]) => ({
          name,
          hours: hours(r.minutes),
          billableHours: hours(r.billable),
          amount: round(r.amount),
        }))
          .sort((a, b) => b.hours - a.hours)
          .slice(0, 10),
      },
    };
  } catch (error) {
    console.error("Error computing reports:", error);
    return emptyReports("Rs", range);
  }
};
