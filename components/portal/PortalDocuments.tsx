"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, Check, X } from "lucide-react";
import { usePortalMe, usePortalQuery, portalSend, errorText } from "@/lib/portalApi";
import { formatDate, formatMoney } from "@/lib/format";
import {
  PageTitle,
  PCard,
  PTable,
  Money,
  Status,
  PageLoading,
  ErrorNote,
  FilterRow,
  fieldClass,
  primaryBtn,
  outlineBtn,
  dangerBtn,
} from "./PortalUI";
import PortalComments from "./PortalComments";

/* ------------------------------ shared bits ------------------------------ */

interface Line {
  id: number;
  title?: string;
  name?: string;
  description?: string | null;
  quantity: number | string;
  rate: number | string;
  amount: number | string;
}

const LinesTable: React.FC<{ lines: Line[]; currency: string }> = ({ lines, currency }) => (
  <PTable<Line>
    rows={lines}
    getId={(l) => l.id}
    empty="No line items."
    columns={[
      {
        key: "item",
        label: "Item",
        render: (l) => (
          <div>
            <p className="font-semibold text-slate-900">{l.title || l.name}</p>
            {l.description && <p className="text-[12px] text-slate-500 whitespace-pre-wrap">{l.description}</p>}
          </div>
        ),
      },
      { key: "qty", label: "Qty", align: "right", render: (l) => Number(l.quantity) },
      { key: "rate", label: "Rate", align: "right", render: (l) => formatMoney(l.rate) },
      {
        key: "amount",
        label: "Amount",
        align: "right",
        render: (l) => <Money amount={l.amount} currency={currency} className="font-semibold text-slate-900" />,
      },
    ]}
  />
);

const Totals: React.FC<{ rows: { label: string; value: number; strong?: boolean; hide?: boolean }[]; currency: string }> = ({
  rows,
  currency,
}) => (
  <dl className="ml-auto w-full sm:w-72 mt-4 space-y-2 text-[14px]">
    {rows
      .filter((r) => !r.hide)
      .map((r) => (
        <div
          key={r.label}
          className={`flex justify-between ${r.strong ? "pt-2 border-t border-slate-200 text-[16px] font-bold text-slate-900" : "text-slate-600"}`}
        >
          <dt>{r.label}</dt>
          <dd className="tabular-nums">
            {formatMoney(r.value)} {currency}
          </dd>
        </div>
      ))}
  </dl>
);

const PrintButton: React.FC<{ label: string }> = ({ label }) => (
  <button onClick={() => window.print()} className={outlineBtn}>
    <Printer className="w-4 h-4" />
    {label}
  </button>
);

const useId = () => {
  const params = useParams<{ id: string }>();
  return params?.id;
};

/* -------------------------------- invoices -------------------------------- */

interface InvoiceRow {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  total: number | string;
  remaining: number | string;
  currency: string;
  status: string;
}

export const PortalInvoices: React.FC = () => {
  const { data, error, loading } = usePortalQuery<{ invoices: InvoiceRow[] }>("/invoices");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const rows = useMemo(
    () =>
      (data?.invoices || []).filter(
        (i) =>
          (status === "All" || i.status === status) &&
          (!search || i.invoiceNumber.toLowerCase().includes(search.toLowerCase())),
      ),
    [data, search, status],
  );
  if (loading) return <PageLoading />;
  if (error) return <ErrorNote message={error.message} />;
  return (
    <>
      <PageTitle title="Invoices" subtitle="Your invoices and their payment status." />
      <PCard>
        <FilterRow>
          <input className={fieldClass} placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className={`${fieldClass} sm:w-48`} value={status} onChange={(e) => setStatus(e.target.value)}>
            {["All", "Sent", "Partially Paid", "Paid", "Overdue", "Written Off"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </FilterRow>
        <PTable<InvoiceRow>
          rows={rows}
          getId={(i) => i.id}
          href={(i) => `/portal/invoices/${i.id}`}
          empty="No invoices found."
          columns={[
            { key: "n", label: "Invoice", render: (i) => <span className="font-semibold text-slate-900">{i.invoiceNumber}</span> },
            { key: "d", label: "Date", render: (i) => formatDate(i.invoiceDate) },
            { key: "due", label: "Due date", render: (i) => formatDate(i.dueDate) },
            { key: "t", label: "Amount", align: "right", render: (i) => <Money amount={i.total} currency={i.currency} /> },
            { key: "r", label: "Balance", align: "right", render: (i) => <Money amount={i.remaining} currency={i.currency} className="font-semibold text-slate-900" /> },
            { key: "s", label: "Status", render: (i) => <Status status={i.status} /> },
          ]}
        />
      </PCard>
    </>
  );
};

interface InvoiceDetail {
  invoice: InvoiceRow & {
    subTotal: number | string;
    received: number | string;
    discountPercent?: number;
    notes?: string | null;
    items: Line[];
  };
  payments: { id: number; paymentNumber?: number; date: string; mode: string; amount: number }[];
}

export const PortalInvoiceView: React.FC = () => {
  const id = useId();
  const { me } = usePortalMe();
  const { data, error, loading } = usePortalQuery<InvoiceDetail>(id ? `/invoices/${id}` : null);
  if (loading) return <PageLoading />;
  if (error || !data) return <ErrorNote message={error?.message || "Invoice not found"} />;
  const { invoice: inv, payments } = data;
  const unpaid = ["Sent", "Partially Paid", "Overdue"].includes(inv.status);
  const discount = (Number(inv.subTotal) * (inv.discountPercent || 0)) / 100;

  return (
    <>
      <PageTitle
        back={{ href: "/portal/invoices", label: "Back to invoices" }}
        title={`Invoice ${inv.invoiceNumber}`}
        subtitle={`Issued ${formatDate(inv.invoiceDate)}${inv.dueDate ? ` · Due ${formatDate(inv.dueDate)}` : ""}`}
        actions={
          <>
            <PrintButton label="Download PDF" />
            <PrintButton label="Print" />
          </>
        }
      />

      <div className="space-y-4">
        <PCard>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-[12px] uppercase tracking-wide text-slate-500">From</p>
              <p className="text-[15px] font-semibold text-slate-900">{me?.organization.name}</p>
              {me?.organization.email && <p className="text-[13px] text-slate-500">{me.organization.email}</p>}
              <p className="mt-3 text-[12px] uppercase tracking-wide text-slate-500">Billed to</p>
              <p className="text-[15px] font-semibold text-slate-900">{me?.customer.displayName}</p>
            </div>
            <div className="sm:text-right">
              <Status status={inv.status} />
              <p className="mt-3 text-[12px] uppercase tracking-wide text-slate-500">Amount due</p>
              <p className="text-[30px] leading-9 font-bold text-slate-900 tabular-nums">
                {formatMoney(inv.remaining)} <span className="text-[16px]">{inv.currency}</span>
              </p>
              {unpaid && (
                <p className="text-[12px] text-slate-500 mt-1 print:hidden">
                  Contact {me?.organization.name} to arrange payment.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <LinesTable lines={inv.items || []} currency={inv.currency} />
            <Totals
              currency={inv.currency}
              rows={[
                { label: "Subtotal", value: Number(inv.subTotal) },
                { label: `Discount (${inv.discountPercent}%)`, value: -discount, hide: !inv.discountPercent },
                { label: "Total", value: Number(inv.total), strong: true },
                { label: "Paid", value: Number(inv.received), hide: !Number(inv.received) },
                { label: "Balance due", value: Number(inv.remaining), strong: true, hide: !Number(inv.received) },
              ]}
            />
          </div>

          {inv.notes && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-[12px] uppercase tracking-wide text-slate-500 mb-1">Notes</p>
              <p className="text-[14px] text-slate-700 whitespace-pre-wrap">{inv.notes}</p>
            </div>
          )}
        </PCard>

        {payments.length > 0 && (
          <PCard title="Payments received" className="print:hidden">
            <PTable
              rows={payments}
              getId={(p) => p.id}
              href={(p) => `/portal/payments/${p.id}`}
              empty=""
              columns={[
                { key: "n", label: "Payment", render: (p) => `#${p.paymentNumber ?? p.id}` },
                { key: "d", label: "Date", render: (p) => formatDate(p.date) },
                { key: "m", label: "Method", render: (p) => p.mode },
                { key: "a", label: "Applied", align: "right", render: (p) => <Money amount={p.amount} currency={inv.currency} /> },
              ]}
            />
          </PCard>
        )}

        <PortalComments entityType="invoice" entityId={inv.id} />
      </div>
    </>
  );
};

/* --------------------------------- quotes --------------------------------- */

interface QuoteRow {
  id: number;
  quoteNumber: string;
  quoteDate: string;
  expiryDate?: string | null;
  total: number | string;
  currency: string;
  status: string;
}

export const PortalQuotes: React.FC = () => {
  const { data, error, loading } = usePortalQuery<{ quotes: QuoteRow[] }>("/quotes");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const rows = useMemo(
    () =>
      (data?.quotes || []).filter(
        (q) =>
          (status === "All" || q.status === status) &&
          (!search || q.quoteNumber.toLowerCase().includes(search.toLowerCase())),
      ),
    [data, search, status],
  );
  if (loading) return <PageLoading />;
  if (error) return <ErrorNote message={error.message} />;
  return (
    <>
      <PageTitle title="Quotes" subtitle="Review and respond to quotes from your supplier." />
      <PCard>
        <FilterRow>
          <input className={fieldClass} placeholder="Search quotes..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className={`${fieldClass} sm:w-48`} value={status} onChange={(e) => setStatus(e.target.value)}>
            {["All", "Sent", "Viewed", "Accepted", "Declined", "Expired", "Converted"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </FilterRow>
        <PTable<QuoteRow>
          rows={rows}
          getId={(q) => q.id}
          href={(q) => `/portal/quotes/${q.id}`}
          empty="No quotes found."
          columns={[
            { key: "n", label: "Quote", render: (q) => <span className="font-semibold text-slate-900">{q.quoteNumber}</span> },
            { key: "d", label: "Date", render: (q) => formatDate(q.quoteDate) },
            { key: "e", label: "Expiry", render: (q) => formatDate(q.expiryDate) },
            { key: "t", label: "Amount", align: "right", render: (q) => <Money amount={q.total} currency={q.currency} className="font-semibold text-slate-900" /> },
            { key: "s", label: "Status", render: (q) => <Status status={q.status} /> },
          ]}
        />
      </PCard>
    </>
  );
};

interface QuoteDetail {
  quote: QuoteRow & {
    referenceNumber?: string | null;
    subTotal: number | string;
    discount: number | string;
    discountPercent: number;
    tax: number | string;
    shipping: number | string;
    adjustment: number | string;
    notes?: string | null;
    terms?: string | null;
    items: Line[];
  };
}

export const PortalQuoteView: React.FC = () => {
  const id = useId();
  const { me } = usePortalMe();
  const { data, error, loading, refresh } = usePortalQuery<QuoteDetail>(id ? `/quotes/${id}` : null);
  const [busy, setBusy] = useState<"" | "accept" | "decline">("");
  const [actionError, setActionError] = useState("");

  if (loading) return <PageLoading />;
  if (error || !data) return <ErrorNote message={error?.message || "Quote not found"} />;
  const q = data.quote;
  const expired = q.expiryDate ? new Date(q.expiryDate) < new Date() : false;
  const canRespond = ["Sent", "Viewed"].includes(q.status) && !expired;

  const respond = async (action: "accept" | "decline") => {
    setBusy(action);
    setActionError("");
    try {
      await portalSend("POST", `/quotes/${q.id}/${action}`);
      await refresh();
    } catch (err) {
      setActionError(errorText(err, "Failed to update quote"));
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <PageTitle
        back={{ href: "/portal/quotes", label: "Back to quotes" }}
        title={`Quote ${q.quoteNumber}`}
        subtitle={`${formatDate(q.quoteDate)}${q.expiryDate ? ` · Valid until ${formatDate(q.expiryDate)}` : ""}`}
        actions={
          <>
            <PrintButton label="Download PDF" />
            {canRespond && (
              <>
                <button className={dangerBtn} disabled={!!busy} onClick={() => respond("decline")}>
                  <X className="w-4 h-4" />
                  Decline
                </button>
                <button className={primaryBtn} disabled={!!busy} onClick={() => respond("accept")}>
                  <Check className="w-4 h-4" />
                  Accept
                </button>
              </>
            )}
          </>
        }
      />
      {actionError && <div className="mb-4"><ErrorNote message={actionError} /></div>}

      <div className="space-y-4">
        <PCard>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-[12px] uppercase tracking-wide text-slate-500">From</p>
              <p className="text-[15px] font-semibold text-slate-900">{me?.organization.name}</p>
              <p className="mt-3 text-[12px] uppercase tracking-wide text-slate-500">Prepared for</p>
              <p className="text-[15px] font-semibold text-slate-900">{me?.customer.displayName}</p>
              {q.referenceNumber && <p className="text-[13px] text-slate-500">Ref: {q.referenceNumber}</p>}
            </div>
            <div className="sm:text-right">
              <Status status={expired && ["Sent", "Viewed"].includes(q.status) ? "Expired" : q.status} />
              <p className="mt-3 text-[12px] uppercase tracking-wide text-slate-500">Total</p>
              <p className="text-[30px] leading-9 font-bold text-slate-900 tabular-nums">
                {formatMoney(q.total)} <span className="text-[16px]">{q.currency}</span>
              </p>
            </div>
          </div>

          <div className="mt-6">
            <LinesTable lines={q.items || []} currency={q.currency} />
            <Totals
              currency={q.currency}
              rows={[
                { label: "Subtotal", value: Number(q.subTotal) },
                { label: `Discount (${q.discountPercent}%)`, value: -Number(q.discount), hide: !Number(q.discount) },
                { label: "Tax", value: Number(q.tax), hide: !Number(q.tax) },
                { label: "Shipping", value: Number(q.shipping), hide: !Number(q.shipping) },
                { label: "Adjustment", value: Number(q.adjustment), hide: !Number(q.adjustment) },
                { label: "Total", value: Number(q.total), strong: true },
              ]}
            />
          </div>

          {(q.notes || q.terms) && (
            <div className="mt-6 pt-4 border-t border-slate-100 grid sm:grid-cols-2 gap-4">
              {q.notes && (
                <div>
                  <p className="text-[12px] uppercase tracking-wide text-slate-500 mb-1">Notes</p>
                  <p className="text-[14px] text-slate-700 whitespace-pre-wrap">{q.notes}</p>
                </div>
              )}
              {q.terms && (
                <div>
                  <p className="text-[12px] uppercase tracking-wide text-slate-500 mb-1">Terms & conditions</p>
                  <p className="text-[14px] text-slate-700 whitespace-pre-wrap">{q.terms}</p>
                </div>
              )}
            </div>
          )}
        </PCard>

        <PortalComments entityType="quote" entityId={q.id} />
      </div>
    </>
  );
};

/* -------------------------------- payments -------------------------------- */

interface PaymentRow {
  id: number;
  paymentNumber?: number | null;
  date: string;
  mode: string;
  amount: number;
  currency: string;
  invoices: string[];
}

export const PortalPayments: React.FC = () => {
  const { data, error, loading } = usePortalQuery<{ payments: PaymentRow[] }>("/payments");
  if (loading) return <PageLoading />;
  if (error) return <ErrorNote message={error.message} />;
  return (
    <>
      <PageTitle title="Payments" subtitle="Payments you have made." />
      <PCard>
        <PTable<PaymentRow>
          rows={data?.payments || []}
          getId={(p) => p.id}
          href={(p) => `/portal/payments/${p.id}`}
          empty="No payments found."
          columns={[
            { key: "n", label: "Payment", render: (p) => <span className="font-semibold text-slate-900">#{p.paymentNumber ?? p.id}</span> },
            { key: "d", label: "Date", render: (p) => formatDate(p.date) },
            { key: "i", label: "Invoices", render: (p) => p.invoices.join(", ") || "—" },
            { key: "m", label: "Method", render: (p) => p.mode },
            { key: "a", label: "Amount", align: "right", render: (p) => <Money amount={p.amount} currency={p.currency} className="font-semibold text-slate-900" /> },
          ]}
        />
      </PCard>
    </>
  );
};

interface PaymentDetail {
  payment: {
    id: number;
    paymentNumber?: number | null;
    date: string;
    mode: string;
    referenceNo?: string | null;
    amount: number;
    currency: string;
    notes?: string | null;
    invoices: { id: number; invoiceNumber: string; amount: number }[];
  };
}

export const PortalPaymentView: React.FC = () => {
  const id = useId();
  const { me } = usePortalMe();
  const { data, error, loading } = usePortalQuery<PaymentDetail>(id ? `/payments/${id}` : null);
  if (loading) return <PageLoading />;
  if (error || !data) return <ErrorNote message={error?.message || "Payment not found"} />;
  const p = data.payment;
  const field = (label: string, value: React.ReactNode) => (
    <div className="py-3 flex justify-between gap-4 border-b border-slate-100 last:border-0 text-[14px]">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900 text-right">{value || "—"}</dd>
    </div>
  );
  return (
    <>
      <PageTitle
        back={{ href: "/portal/payments", label: "Back to payments" }}
        title={`Payment #${p.paymentNumber ?? p.id}`}
        subtitle={`Received ${formatDate(p.date)}`}
        actions={
          <>
            <PrintButton label="Download receipt" />
            <PrintButton label="Print" />
          </>
        }
      />
      <PCard title={`Payment receipt · ${me?.organization.name || ""}`}>
        <dl>
          {field("Amount", <Money amount={p.amount} currency={p.currency} />)}
          {field("Date", formatDate(p.date))}
          {field("Method", p.mode)}
          {field("Reference", p.referenceNo)}
          {field("Received from", me?.customer.displayName)}
          {field(
            "Applied to",
            p.invoices.length
              ? p.invoices.map((i) => `${i.invoiceNumber} (${formatMoney(i.amount)})`).join(", ")
              : "",
          )}
          {field("Notes", p.notes)}
        </dl>
      </PCard>
    </>
  );
};
