"use client";

import { useMemo, useState } from "react";
import { usePortalMe, usePortalQuery } from "@/lib/portalApi";
import { formatDate, formatMoney, toDateInput } from "@/lib/format";
import {
  getRangeBounds,
  RANGE_OPTIONS,
  type StatementRange,
} from "@/components/customer/CustomerStatement";
import type { Statement, Row } from "@/components/portal/PortalStatements";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const usePortalStatements = () => {
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

  return {
    range, setRange, customFrom, setCustomFrom, customTo, setCustomTo, error, loading, statements,
    periodLabel, rangeName, rowsFor, downloading, handleDownload,
  };
};

export default usePortalStatements;
