"use client";

import React from "react";
import { FileText, Receipt, Timer } from "lucide-react";
import { Table, StatusBadge } from "@/components/ui";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import type { CustomerRelatedRecords } from "@/hooks/customers/useCustomerRelatedRecords";
import { statusVariant } from "@/lib/statusVariants";
import { formatDate, formatMoney } from "@/lib/format";
import { formatDuration, type TimeEntry } from "@/types/timeEntry";
import type { Quote } from "@/types/quote";
import type { Expense } from "@/types/expense";
import type { TableColumn } from "@/types/common";

export type RelatedTab = "quotes" | "expenses" | "timeTracking";

const quoteColumns: TableColumn<Quote>[] = [
  { key: "quoteNumber", label: "QUOTE #", render: (q) => <span className="font-bold text-gray-900">{q.quoteNumber}</span> },
  { key: "quoteDate", label: "DATE", render: (q) => <span className="text-gray-600">{formatDate(q.quoteDate)}</span> },
  { key: "expiryDate", label: "EXPIRY", render: (q) => <span className="text-gray-600">{formatDate(q.expiryDate)}</span> },
  {
    key: "total",
    label: "AMOUNT",
    align: "right",
    render: (q) => <span className="font-bold text-gray-900">{formatMoney(q.total)} {q.currency}</span>,
  },
  { key: "status", label: "STATUS", render: (q) => <StatusBadge status={q.status} variant={statusVariant(q.status)} /> },
];

const expenseColumns: TableColumn<Expense>[] = [
  { key: "expenseNumber", label: "EXPENSE #", render: (e) => <span className="font-bold text-gray-900">{e.expenseNumber}</span> },
  { key: "expenseDate", label: "DATE", render: (e) => <span className="text-gray-600">{formatDate(e.expenseDate)}</span> },
  { key: "category", label: "CATEGORY", render: (e) => <span className="text-gray-600">{e.category?.name || ""}</span> },
  {
    key: "total",
    label: "AMOUNT",
    align: "right",
    render: (e) => <span className="font-bold text-gray-900">{formatMoney(e.total)} {e.currency}</span>,
  },
  { key: "status", label: "STATUS", render: (e) => <StatusBadge status={e.status} variant={statusVariant(e.status)} /> },
];

const timeColumns: TableColumn<TimeEntry>[] = [
  { key: "entryNumber", label: "ENTRY #", render: (t) => <span className="font-bold text-gray-900">{t.entryNumber}</span> },
  { key: "date", label: "DATE", render: (t) => <span className="text-gray-600">{formatDate(t.date)}</span> },
  { key: "description", label: "DESCRIPTION", render: (t) => <span className="text-gray-600">{[t.project, t.description].filter(Boolean).join(" · ")}</span> },
  { key: "duration", label: "DURATION", render: (t) => <span className="text-gray-900">{formatDuration(t.duration)}</span> },
  {
    key: "amount",
    label: "AMOUNT",
    align: "right",
    render: (t) => <span className="font-bold text-gray-900">{formatMoney(t.amount)}</span>,
  },
  { key: "status", label: "STATUS", render: (t) => <StatusBadge status={t.status} variant={statusVariant(t.status)} /> },
];

const noop = () => {};

/** Quotes / Expenses / Time Tracking tabs on the customer detail page. */
const CustomerRelatedTable: React.FC<{ tab: RelatedTab; related: CustomerRelatedRecords }> = ({
  tab,
  related,
}) => {
  const router = useRouter();
  const common = {
    selectedIds: [],
    onSelectAll: noop,
    onSelectRow: noop,
    showCheckbox: false,
    variant: "spacious" as const,
  };

  if (tab === "quotes") {
    return (
      <Table<Quote>
        {...common}
        columns={quoteColumns}
        data={related.quotes}
        getRowId={(q) => q.id}
        onRowClick={(q) => router.push(`/quotes/${q.id}`)}
        emptyMessage="No quotes found"
        emptyIcon={FileText}
      />
    );
  }
  if (tab === "expenses") {
    return (
      <Table<Expense>
        {...common}
        columns={expenseColumns}
        data={related.expenses}
        getRowId={(e) => e.id}
        onRowClick={(e) => router.push(`/expenses/${e.id}`)}
        emptyMessage="No expenses found"
        emptyIcon={Receipt}
      />
    );
  }
  return (
    <Table<TimeEntry>
      {...common}
      columns={timeColumns}
      data={related.timeEntries}
      getRowId={(t) => t.id}
      onRowClick={(t) => router.push(`/time-tracking/${t.id}`)}
      emptyMessage="No time entries found"
      emptyIcon={Timer}
    />
  );
};

export default CustomerRelatedTable;
