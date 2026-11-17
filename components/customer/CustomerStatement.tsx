"use client";

import React from "react";
import { Calendar, FileText } from "lucide-react";
import { Table, CurrencyDisplay, Select } from "@/components/ui";
import type { TableColumn } from "@/types/common";
import type { StatementRange, StatementRow } from "@/hooks/customers/useCustomerStatement";

export { useCustomerStatement, getRangeBounds } from "@/hooks/customers/useCustomerStatement";
export type { StatementRange, StatementRow } from "@/hooks/customers/useCustomerStatement";

const money = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const RANGE_OPTIONS: { value: StatementRange; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "thisWeek", label: "This Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "thisQuarter", label: "This Quarter" },
  { value: "thisYear", label: "This Year" },
  { value: "yesterday", label: "Yesterday" },
  { value: "prevWeek", label: "Previous Week" },
  { value: "prevMonth", label: "Previous Month" },
  { value: "prevQuarter", label: "Previous Quarter" },
  { value: "prevYear", label: "Previous Year" },
  { value: "1m", label: "Last 1 Month" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last 1 Year" },
  { value: "custom", label: "Custom" },
];

interface PickerProps {
  range: StatementRange;
  from: string;
  to: string;
  onRange: (r: StatementRange) => void;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
}

export const StatementRangePicker: React.FC<PickerProps> = ({ range, from, to, onRange, onFrom, onTo }) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="w-48">
      <Select
        selectSize="sm"
        searchable={false}
        leftIcon={Calendar}
        options={RANGE_OPTIONS}
        value={range}
        onValueChange={(v) => onRange(v as StatementRange)}
      />
    </div>
    {range === "custom" && (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <input type="date" value={from} max={to || undefined} onChange={(e) => onFrom(e.target.value)} className="h-9 rounded-md border border-slate-300 px-2 text-xs" />
        <span>to</span>
        <input type="date" value={to} min={from || undefined} onChange={(e) => onTo(e.target.value)} className="h-9 rounded-md border border-slate-300 px-2 text-xs" />
      </div>
    )}
  </div>
);

interface Props {
  rows: StatementRow[];
  balance: number;
  currency: string;
}

const CustomerStatement: React.FC<Props> = ({ rows, balance, currency }) => {
  const columns: TableColumn<StatementRow>[] = [
    { key: "date", label: "DATE", render: (r) => <span className="text-gray-600">{r.date}</span> },
    { key: "type", label: "TYPE", render: (r) => <span className="text-gray-600">{r.type}</span> },
    { key: "reference", label: "REFERENCE", render: (r) => <span className="font-bold text-gray-900">{r.reference}</span> },
    {
      key: "debit",
      label: "INVOICED",
      align: "right" as const,
      render: (r) => (r.debit ? <CurrencyDisplay amount={r.debit} currency={currency} className="text-gray-900" /> : null),
    },
    {
      key: "credit",
      label: "PAID",
      align: "right" as const,
      render: (r) => (r.credit ? <CurrencyDisplay amount={r.credit} currency={currency} className="text-gray-900" /> : null),
    },
    {
      key: "balance",
      label: "BALANCE",
      align: "right" as const,
      render: (r) => <CurrencyDisplay amount={r.balance} currency={currency} className="font-bold text-gray-900" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-700">
        Balance Due:{" "}
        <span className="font-bold text-slate-900">
          {currency} {money(balance)}
        </span>
      </div>
      <Table
        columns={columns}
        data={rows}
        selectedIds={[]}
        onSelectAll={() => {}}
        onSelectRow={() => {}}
        getRowId={(r) => r.id}
        emptyMessage="No statement entries found"
        emptyIcon={FileText}
        showCheckbox={false}
        variant="spacious"
      />
    </div>
  );
};

export default CustomerStatement;
