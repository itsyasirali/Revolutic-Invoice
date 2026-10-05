"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { formatDate } from "@/lib/format";
import type { ReportRange, ReportRangeOption, ReportsData } from "@/types/reports";

interface ReportsViewProps {
  data: ReportsData;
  ranges: ReportRangeOption[];
}

const TABS = [
  { label: "Overview", value: "overview" },
  { label: "Sales", value: "sales" },
  { label: "Receivables", value: "receivables" },
  { label: "Expenses", value: "expenses" },
  { label: "Time", value: "time" },
];

const compact = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${+(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${+(value / 1_000).toFixed(1)}k`;
  return String(value);
};

const Panel = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <section className="bg-white rounded-md p-5 border border-slate-200/80 shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
    <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
    {hint && <p className="text-xs text-slate-400 mb-4">{hint}</p>}
    {!hint && <div className="mb-4" />}
    {children}
  </section>
);

const Stat = ({
  label,
  value,
  tone = "text-slate-900",
}: {
  label: string;
  value: string;
  tone?: string;
}) => (
  <div className="bg-white rounded-md p-4 border border-slate-200/80 shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className={`mt-1 text-xl font-bold tracking-tight ${tone}`}>{value}</p>
  </div>
);

const Empty = ({ message }: { message: string }) => (
  <p className="py-10 text-center text-sm text-slate-400">{message}</p>
);

interface Column<T> {
  header: string;
  align?: "right";
  cell: (row: T) => React.ReactNode;
}

const DataTable = <T,>({
  columns,
  rows,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  empty: string;
}) => {
  if (rows.length === 0) return <Empty message={empty} />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
            {columns.map((c) => (
              <th
                key={c.header}
                className={`py-2 px-2 font-semibold ${c.align === "right" ? "text-right" : "text-left"}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-50 last:border-0">
              {columns.map((c) => (
                <td
                  key={c.header}
                  className={`py-2.5 px-2 text-slate-700 ${c.align === "right" ? "text-right tabular-nums" : ""}`}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MonthChart = ({
  months,
  currency,
  bars,
}: {
  months: ReportsData["months"];
  currency: string;
  bars: { key: "income" | "expenses" | "invoiced"; name: string; color: string }[];
}) =>
  months.length === 0 ? (
    <Empty message="No data for this period." />
  ) : (
    <div className="w-full h-72 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={months} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} />
          <YAxis
            width={64}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            tickFormatter={(v) => `${currency} ${compact(v)}`}
          />
          <Tooltip
            cursor={{ fill: "#F8FAFC" }}
            formatter={(v) => `${currency} ${Number(v).toLocaleString()}`}
          />
          {bars.map((b) => (
            <Bar
              key={b.key}
              dataKey={b.key}
              name={b.name}
              fill={b.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

const ReportsView = ({ data, ranges }: ReportsViewProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState("overview");
  const { currency, summary } = data;

  const money = (n: number) =>
    `${currency} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const changeRange = (range: ReportRange) => router.push(`${pathname}?range=${range}`);

  const collectionRate =
    summary.invoiced > 0 ? Math.round((summary.received / summary.invoiced) * 100) : 0;
  const billablePct =
    data.time.totalHours > 0
      ? Math.round((data.time.billableHours / data.time.totalHours) * 100)
      : 0;
  const maxAging = Math.max(1, ...data.aging.map((b) => b.amount));

  return (
    <div className="w-full space-y-5 pb-12 animate-fade-in">
      <PageHeader
        title="Reports"
        subtitle={<span>{data.rangeLabel}</span>}
        actions={
          <select
            value={data.range}
            onChange={(e) => changeRange(e.target.value as ReportRange)}
            aria-label="Report period"
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:border-primary"
          >
            {ranges.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        }
      />

      <div className="px-2 sm:px-4 md:px-6 space-y-5">
        <Tabs tabs={TABS} activeTab={tab} onTabChange={setTab} />

        {tab === "overview" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat label="Invoiced" value={money(summary.invoiced)} />
              <Stat label="Payments Received" value={money(summary.received)} tone="text-emerald-600" />
              <Stat label="Expenses" value={money(summary.expenses)} tone="text-red-500" />
              <Stat
                label="Net Profit"
                value={money(summary.netProfit)}
                tone={summary.netProfit >= 0 ? "text-emerald-600" : "text-red-500"}
              />
            </div>
            <Panel title="Income vs Expenses" hint="Payments received against expenses, by month">
              <MonthChart
                months={data.months}
                currency={currency}
                bars={[
                  { key: "income", name: "Income", color: "#3B82F6" },
                  { key: "expenses", name: "Expenses", color: "#EF4444" },
                ]}
              />
            </Panel>
          </>
        )}

        {tab === "sales" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat label="Invoiced" value={money(summary.invoiced)} />
              <Stat label="Invoices" value={String(summary.invoiceCount)} />
              <Stat label="Fully Paid" value={String(summary.paidCount)} />
              <Stat label="Collection Rate" value={`${collectionRate}%`} />
            </div>
            <Panel title="Invoiced by Month" hint="Excludes draft and cancelled invoices">
              <MonthChart months={data.months} currency={currency} bars={[{ key: "invoiced", name: "Invoiced", color: "#3B82F6" }]} />
            </Panel>
            <Panel title="Top Customers" hint="Ranked by amount invoiced in this period">
              <DataTable
                rows={data.customers}
                empty="No invoices in this period."
                columns={[
                  { header: "Customer", cell: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
                  { header: "Invoices", align: "right", cell: (r) => r.invoices },
                  { header: "Invoiced", align: "right", cell: (r) => money(r.invoiced) },
                  { header: "Received", align: "right", cell: (r) => money(r.received) },
                  { header: "Outstanding", align: "right", cell: (r) => money(r.outstanding) },
                ]}
              />
            </Panel>
          </>
        )}

        {tab === "receivables" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Total Outstanding" value={money(summary.outstanding)} />
              <Stat label="Overdue" value={money(summary.overdue)} tone="text-red-500" />
            </div>
            <Panel title="Receivables Aging" hint="Unpaid balances as of today, by how late they are">
              <div className="space-y-3">
                {data.aging.map((b) => (
                  <div key={b.label} className="grid grid-cols-[96px_1fr_auto] items-center gap-3 text-sm">
                    <span className="text-slate-600">{b.label}</span>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${b.label === "Not yet due" ? "bg-primary" : "bg-amber-500"}`}
                        style={{ width: `${(b.amount / maxAging) * 100}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-slate-700">
                      {money(b.amount)}{" "}
                      <span className="text-xs text-slate-400">({b.count})</span>
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Most Overdue Invoices">
              <DataTable
                rows={data.overdueInvoices}
                empty="Nothing is overdue."
                columns={[
                  {
                    header: "Invoice",
                    cell: (r) => (
                      <Link href={`${pathname.replace(/\/reports$/, "")}/invoices/${r.id}`} className="font-medium text-primary hover:underline">
                        {r.invoiceNumber}
                      </Link>
                    ),
                  },
                  { header: "Customer", cell: (r) => r.customerName },
                  { header: "Due", cell: (r) => formatDate(r.dueDate) },
                  { header: "Days Overdue", align: "right", cell: (r) => r.daysOverdue },
                  { header: "Balance", align: "right", cell: (r) => money(r.amount) },
                ]}
              />
            </Panel>
          </>
        )}

        {tab === "expenses" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Total Expenses" value={money(summary.expenses)} tone="text-red-500" />
              <Stat label="Categories" value={String(data.expenseCategories.length)} />
            </div>
            <Panel title="Expenses by Month">
              <MonthChart months={data.months} currency={currency} bars={[{ key: "expenses", name: "Expenses", color: "#EF4444" }]} />
            </Panel>
            <Panel title="Expenses by Category">
              <DataTable
                rows={data.expenseCategories}
                empty="No expenses in this period."
                columns={[
                  { header: "Category", cell: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
                  { header: "Expenses", align: "right", cell: (r) => r.count },
                  { header: "Amount", align: "right", cell: (r) => money(r.amount) },
                  {
                    header: "Share",
                    align: "right",
                    cell: (r) =>
                      `${summary.expenses > 0 ? Math.round((r.amount / summary.expenses) * 100) : 0}%`,
                  },
                ]}
              />
            </Panel>
          </>
        )}

        {tab === "time" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat label="Hours Tracked" value={String(data.time.totalHours)} />
              <Stat label="Billable Hours" value={String(data.time.billableHours)} />
              <Stat label="Billable Share" value={`${billablePct}%`} />
              <Stat label="Unbilled Amount" value={money(data.time.unbilledAmount)} tone="text-amber-600" />
            </div>
            <Panel title="Time by Project">
              <DataTable
                rows={data.time.byProject}
                empty="No time tracked in this period."
                columns={[
                  { header: "Project", cell: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
                  { header: "Hours", align: "right", cell: (r) => r.hours },
                  { header: "Billable Hours", align: "right", cell: (r) => r.billableHours },
                  { header: "Billable Amount", align: "right", cell: (r) => money(r.amount) },
                ]}
              />
            </Panel>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsView;
