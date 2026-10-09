"use client";

import React, { useMemo, useState } from "react";
import axios from "@/lib/axios";
import { Calendar, FileText } from "lucide-react";
import { Table, CurrencyDisplay, Select } from "@/components/ui";
import type { TableColumn } from "@/types/common";
import type { UIInvoiceListItem, PaymentTransaction } from "@/types/customer";

interface HookArgs {
  customerName: string;
  customerId: string;
  customerRecordId: string | number;
  currency: string;
  address: string;
  invoices: UIInvoiceListItem[];
  transactions: PaymentTransaction[];
  initialRange?: { range: StatementRange; from?: string; to?: string };
}

export interface StatementRow {
  id: string;
  time: number;
  date: string;
  type: "Invoice" | "Payment" | "Opening Balance";
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

export type StatementRange =
  | "all"
  | "today"
  | "thisWeek"
  | "thisMonth"
  | "thisQuarter"
  | "thisYear"
  | "yesterday"
  | "prevWeek"
  | "prevMonth"
  | "prevQuarter"
  | "prevYear"
  | "1m"
  | "3m"
  | "6m"
  | "1y"
  | "custom";

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

const MONTHS: Record<string, number> = { "1m": 1, "3m": 3, "6m": 6, "1y": 12 };

export const getRangeBounds = (
  range: StatementRange,
  from: string,
  to: string,
): { start: number | null; end: number | null } => {
  if (range === "all") return { start: null, end: null };
  if (range === "custom") {
    const s = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const e = to ? new Date(`${to}T23:59:59.999`).getTime() : null;
    return { start: s, end: e };
  }
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const day = now.getDate();
  const dow = (now.getDay() + 6) % 7; // Monday = 0
  const q = Math.floor(m / 3) * 3;
  const endOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
  const span = (s: Date, e: Date) => ({ start: s.getTime(), end: endOf(e) });

  switch (range) {
    case "today":
      return span(new Date(y, m, day), now);
    case "yesterday":
      return span(new Date(y, m, day - 1), new Date(y, m, day - 1));
    case "thisWeek":
      return span(new Date(y, m, day - dow), now);
    case "prevWeek":
      return span(new Date(y, m, day - dow - 7), new Date(y, m, day - dow - 1));
    case "thisMonth":
      return span(new Date(y, m, 1), now);
    case "prevMonth":
      return span(new Date(y, m - 1, 1), new Date(y, m, 0));
    case "thisQuarter":
      return span(new Date(y, q, 1), now);
    case "prevQuarter":
      return span(new Date(y, q - 3, 1), new Date(y, q, 0));
    case "thisYear":
      return span(new Date(y, 0, 1), now);
    case "prevYear":
      return span(new Date(y - 1, 0, 1), new Date(y - 1, 11, 31));
    default: {
      const start = new Date(y, m - MONTHS[range], day);
      return { start: start.getTime(), end: now.getTime() };
    }
  }
};

const toTime =(v: unknown) => {
  const t = new Date(v as string).getTime();
  return isNaN(t) ? 0 : t;
};
const fmtDate = (t: number, fallback: string) =>
  t ? new Date(t).toLocaleDateString("en-GB") : fallback;
const money = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const useCustomerStatement = ({
  customerName,
  customerId,
  customerRecordId,
  currency,
  address,
  invoices,
  transactions,
  initialRange,
}: HookArgs) => {
  const [downloading, setDownloading] = useState(false);
  const [range, setRange] = useState<StatementRange>(initialRange?.range ?? "all");
  const [from, setFrom] = useState(initialRange?.from ?? "");
  const [to, setTo] = useState(initialRange?.to ?? "");

  const rows = useMemo<StatementRow[]>(() => {
    const entries = [
      ...invoices
        .filter((i) => !/void|draft/i.test(i.status?.tooltip || ""))
        .map((i) => ({
          id: `inv-${i.id}`,
          time: toTime(i.date),
          date: i.date,
          type: "Invoice" as const,
          reference: i.invoice,
          debit: Number(i.amount) || 0,
          credit: 0,
        })),
      ...transactions.map((p) => ({
        id: `pmt-${p.id}`,
        time: toTime(p.paymentDate),
        date: "",
        type: "Payment" as const,
        reference: p.paymentNumber
          ? `PMT-${String(p.paymentNumber).padStart(4, "0")}`
          : p.referenceNo || "Payment",
        debit: 0,
        credit: Number(p.amountReceived) || 0,
      })),
    ].sort((a, b) => a.time - b.time);

    let balance = 0;
    const ledger = entries.map((e) => {
      balance += e.debit - e.credit;
      return { ...e, date: fmtDate(e.time, e.date), balance };
    });

    const { start, end } = getRangeBounds(range, from, to);
    if (start === null && end === null) return ledger;

    const inRange = ledger.filter(
      (r) => (start === null || r.time >= start) && (end === null || r.time <= end),
    );
    if (start === null) return inRange;
    const before = ledger.filter((r) => r.time < start);
    const opening = before.length ? before[before.length - 1].balance : 0;
    const openingRow: StatementRow = {
      id: "opening",
      time: start,
      date: fmtDate(start, ""),
      type: "Opening Balance",
      reference: "",
      debit: 0,
      credit: 0,
      balance: opening,
    };
    return [openingRow, ...inRange];
  }, [invoices, transactions, range, from, to]);

  const totals = useMemo(
    () => ({
      invoiced: rows.reduce((s, r) => s + r.debit, 0),
      paid: rows.reduce((s, r) => s + r.credit, 0),
      balance: rows.length ? rows[rows.length - 1].balance : 0,
    }),
    [rows],
  );

  const periodLabel = useMemo(() => {
    const { start, end } = getRangeBounds(range, from, to);
    if (start === null && end === null) return "All time";
    const f = (t: number) => new Date(t).toLocaleDateString("en-GB");
    return `${start !== null ? f(start) : "Beginning"} - ${f(end ?? Date.now())}`;
  }, [range, from, to]);

  const buildPdf = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
      const body = rows
        .map(
          (r) => `<tr>
            <td>${esc(r.date)}</td><td>${r.type}</td><td>${esc(r.reference)}</td>
            <td style="text-align:right">${r.debit ? money(r.debit) : ""}</td>
            <td style="text-align:right">${r.credit ? money(r.credit) : ""}</td>
            <td style="text-align:right">${money(r.balance)}</td></tr>`,
        )
        .join("");
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="font-family:Arial,sans-serif;font-size:12px;color:#111;padding:24px;width:700px">
          <h1 style="margin:0 0 4px;font-size:22px">Statement of Account</h1>
          <div style="color:#555;margin-bottom:16px">Period: ${periodLabel} (generated ${new Date().toLocaleDateString("en-GB")})</div>
          <div style="font-weight:bold;font-size:14px">${esc(customerName)}</div>
          <div style="color:#555">${esc(customerId)}</div>
          <div style="color:#555;margin-bottom:16px;white-space:pre-line">${esc(address)}</div>
          <table style="width:100%;border-collapse:collapse">
            <thead><tr style="background:#f1f5f9;text-align:left">
              <th style="padding:6px">Date</th><th>Type</th><th>Reference</th>
              <th style="text-align:right">Invoiced</th><th style="text-align:right">Paid</th>
              <th style="text-align:right">Balance</th></tr></thead>
            <tbody>${body || `<tr><td colspan="6" style="padding:12px;text-align:center">No transactions</td></tr>`}</tbody>
          </table>
          <div style="margin-top:16px;text-align:right;line-height:1.7">
            <div>Total Invoiced: ${currency} ${money(totals.invoiced)}</div>
            <div>Total Paid: ${currency} ${money(totals.paid)}</div>
            <div style="font-weight:bold;font-size:14px">Balance Due: ${currency} ${money(totals.balance)}</div>
          </div>
        </div>`;
      el.querySelectorAll("td").forEach((td) => {
        (td as HTMLElement).style.padding = "6px";
        (td as HTMLElement).style.borderBottom = "1px solid #e2e8f0";
      });
      const safe = customerName.replace(/[^\w\- ]+/g, "").trim() || "Customer";
    const worker = html2pdf()
      .set({
        margin: 10,
        filename: `Statement - ${safe}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(el);
    return { worker, filename: `Statement - ${safe}.pdf` };
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { worker } = await buildPdf();
      await worker.save();
    } finally {
      setDownloading(false);
    }
  };

  const sendEmail = async (payload: {
    to: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    message: string;
  }) => {
    const { worker, filename } = await buildPdf();
    const uri: string = await worker.outputPdf("datauristring");
    await axios.post(`/customers/${customerRecordId}/statement/send`, {
      ...payload,
      filename,
      pdfBase64: uri.slice(uri.indexOf(",") + 1),
      balance: totals.balance,
      currency,
    });
  };

  return {
    rows,
    totals,
    downloading,
    handleDownload,
    sendEmail,
    range,
    setRange,
    from,
    setFrom,
    to,
    setTo,
    periodLabel,
  };
};

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
