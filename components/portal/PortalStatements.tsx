"use client";

import React, { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { usePortalMe, usePortalQuery } from "@/lib/portalApi";
import { formatDate, formatMoney, toDateInput } from "@/lib/format";
import { PageHeader, Table, CurrencyDisplay } from "@/components/ui";
import type { TableColumn } from "@/types/common";
import {
  StatementRangePicker,
  getRangeBounds,
  RANGE_OPTIONS,
  type StatementRange,
} from "@/components/customer/CustomerStatement";
import { PageLoading, ErrorNote, TABLE_INSET } from "./PortalUI";

interface StatementLine {
  date: string;
  type: string;
  reference: string;
  charge: number;
  payment: number;
  balance: number;
}

interface Statement {
  currency: string;
  opening: number;
  invoiced: number;
  paid: number;
  closing: number;
  lines: StatementLine[];
}

interface Row {
  id: string;
  date: string;
  type: string;
  reference: string;
  charge: number;
  payment: number;
  balance: number;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const PortalStatements: React.FC = () => {
  const { me } = usePortalMe();
  const [range, setRange] = useState<StatementRange>("thisMonth");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [downloading, setDownloading] = useState(false);

  const { from, to } = useMemo(() => {
    const { start, end } = getRangeBounds(range, customFrom, customTo);
    return {
      from: start === null ? "1970-01-01" : toDateInput(new Date(start)),
      to: toDateInput(new Date(end ?? Date.now())),
    };
  }, [range, customFrom, customTo]);

  const { data, error, loading } = usePortalQuery<{ statements: Statement[] }>(
    `/statement?from=${from}&to=${to}`,
  );
  const statements = data?.statements || [];
  const periodLabel =
    range === "all"
      ? "All time"
      : `${formatDate(from)} - ${formatDate(to)}`;
  const rangeName = RANGE_OPTIONS.find((o) => o.value === range)?.label;

  const rowsFor = (s: Statement): Row[] => [
    ...(range === "all"
      ? []
      : [
          {
            id: "opening",
            date: formatDate(from),
            type: "Opening Balance",
            reference: "",
            charge: 0,
            payment: 0,
            balance: s.opening,
          },
        ]),
    ...s.lines.map((l, i) => ({
      id: `${l.type}-${l.reference}-${i}`,
      date: formatDate(l.date),
      type: l.type,
      reference: l.reference,
      charge: l.charge,
      payment: l.payment,
      balance: l.balance,
    })),
  ];

  const columns = (currency: string): TableColumn<Row>[] => [
    { key: "date", label: "DATE", render: (r) => <span className="text-gray-600">{r.date}</span> },
    { key: "type", label: "TYPE", render: (r) => <span className="text-gray-600">{r.type}</span> },
    { key: "reference", label: "REFERENCE", render: (r) => <span className="font-bold text-gray-900">{r.reference}</span> },
    {
      key: "charge",
      label: "INVOICED",
      align: "right" as const,
      render: (r) => (r.charge ? <CurrencyDisplay amount={r.charge} currency={currency} className="text-gray-900" /> : null),
    },
    {
      key: "payment",
      label: "PAID",
      align: "right" as const,
      render: (r) => (r.payment ? <CurrencyDisplay amount={r.payment} currency={currency} className="text-gray-900" /> : null),
    },
    {
      key: "balance",
      label: "BALANCE",
      align: "right" as const,
      render: (r) => <CurrencyDisplay amount={r.balance} currency={currency} className="font-bold text-gray-900" />,
    },
  ];

  const handleDownload = async () => {
    if (!me || statements.length === 0) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const sections = statements
        .map((s) => {
          const body = rowsFor(s)
            .map(
              (r) => `<tr>
                <td>${esc(r.date)}</td><td>${esc(r.type)}</td><td>${esc(r.reference)}</td>
                <td style="text-align:right">${r.charge ? formatMoney(r.charge) : ""}</td>
                <td style="text-align:right">${r.payment ? formatMoney(r.payment) : ""}</td>
                <td style="text-align:right">${formatMoney(r.balance)}</td></tr>`,
            )
            .join("");
          return `
            <h2 style="margin:24px 0 8px;font-size:15px">Account in ${esc(s.currency)}</h2>
            <table style="width:100%;border-collapse:collapse">
              <thead><tr style="background:#f1f5f9;text-align:left">
                <th style="padding:6px">Date</th><th>Type</th><th>Reference</th>
                <th style="text-align:right">Invoiced</th><th style="text-align:right">Paid</th>
                <th style="text-align:right">Balance</th></tr></thead>
              <tbody>${body}</tbody>
            </table>
            <div style="margin-top:12px;text-align:right;line-height:1.7">
              <div>Total Invoiced: ${esc(s.currency)} ${formatMoney(s.invoiced)}</div>
              <div>Total Paid: ${esc(s.currency)} ${formatMoney(s.paid)}</div>
              <div style="font-weight:bold;font-size:14px">Balance Due: ${esc(s.currency)} ${formatMoney(s.closing)}</div>
            </div>`;
        })
        .join("");
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="font-family:Arial,sans-serif;font-size:12px;color:#111;padding:24px;width:700px">
          <h1 style="margin:0 0 4px;font-size:22px">Statement of Account</h1>
          <div style="color:#555;margin-bottom:16px">Period: ${esc(periodLabel)} (generated ${new Date().toLocaleDateString("en-GB")})</div>
          <div style="font-weight:bold;font-size:14px">${esc(me.customer.displayName || "")}</div>
          <div style="color:#555">${esc(me.organization.name || "")}</div>
          ${sections}
        </div>`;
      el.querySelectorAll("td").forEach((td) => {
        (td as HTMLElement).style.padding = "6px";
        (td as HTMLElement).style.borderBottom = "1px solid #e2e8f0";
      });
      const safe = (me.customer.displayName || "Customer").replace(/[^\w\- ]+/g, "").trim() || "Customer";
      await html2pdf()
        .set({
          margin: 10,
          filename: `Statement - ${safe}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(el)
        .save();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="pb-8 space-y-4">
      <PageHeader
        title="Statement"
        subtitle={<span>{rangeName === "Custom" || range === "all" ? periodLabel : `${rangeName}: ${periodLabel}`}</span>}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatementRangePicker
              range={range}
              from={customFrom}
              to={customTo}
              onRange={setRange}
              onFrom={setCustomFrom}
              onTo={setCustomTo}
            />
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || statements.length === 0}
              className="flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm text-white hover:opacity-90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Preparing..." : "Download Statement"}
            </button>
          </div>
        }
      />

      {loading ? (
        <PageLoading />
      ) : error ? (
        <div className="px-2 sm:px-4 md:px-6">
          <ErrorNote message={error.message} />
        </div>
      ) : statements.length === 0 ? (
        <Table
          columns={columns("")}
          data={[]}
          showCheckbox={false}
          emptyMessage="No statement entries found"
          emptyIcon={FileText}
          variant="spacious"
          className={TABLE_INSET}
        />
      ) : (
        statements.map((s) => (
          <div key={s.currency} className="space-y-4">
            <div className="px-2 sm:px-4 md:px-6 text-sm text-slate-700">
              Balance Due ({s.currency}):{" "}
              <span className="font-bold text-slate-900">
                {s.currency} {formatMoney(s.closing)}
              </span>
            </div>
            <Table<Row>
              columns={columns(s.currency)}
              data={rowsFor(s)}
              getRowId={(r) => r.id}
              showCheckbox={false}
              emptyMessage="No statement entries found"
              emptyIcon={FileText}
              variant="spacious"
              className={TABLE_INSET}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default PortalStatements;
