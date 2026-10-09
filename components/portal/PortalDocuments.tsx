"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { Check, X, ScrollText, DollarSign } from "lucide-react";
import { usePortalMe, usePortalQuery, portalSend, errorText } from "@/lib/portalApi";
import { formatDate, formatMoney } from "@/lib/format";
import { getNavState, setNavState } from "@/lib/clientNavState";
import { Table, StatusBadge, Tabs, Button, PageHeader } from "@/components/ui";
import SplitView from "@/components/ui/SplitView";
import DetailHeader from "@/components/ui/DetailHeader";
import { DetailRow, DetailSection } from "@/components/ui/DetailParts";
import { statusVariant } from "@/lib/statusVariants";
import type { TableColumn } from "@/types/common";
import { PageLoading, ErrorNote, TABLE_INSET } from "./PortalUI";
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

const DETAIL_WRAP = "space-y-6 px-2 sm:px-4 md:px-6 py-2";

const useRouteId = () => useParams<{ id?: string }>()?.id;

/** Navigation state is stored in the browser, so it is only readable after mount. */
const useNavRecord = <T,>(key: string | null): T | undefined => {
  const [record, setRecord] = useState<T>();
  useEffect(() => {
    setRecord(key ? getNavState<T>(key) : undefined);
  }, [key]);
  return record;
};

const LinesTable: React.FC<{ lines: Line[]; currency: string }> = ({ lines, currency }) => {
  const columns: TableColumn<Line>[] = [
    {
      key: "item",
      label: "ITEM DETAILS",
      render: (l) => (
        <div className="space-y-0.5">
          <p className="font-bold text-slate-900 text-sm">{l.title || l.name || "Unnamed Item"}</p>
          {l.description && <p className="text-xs text-slate-500 line-clamp-2">{l.description}</p>}
        </div>
      ),
    },
    {
      key: "quantity",
      label: "QTY",
      align: "center" as const,
      render: (l) => <span className="font-semibold text-slate-700">{Number(l.quantity)}</span>,
    },
    {
      key: "rate",
      label: "RATE",
      align: "right" as const,
      render: (l) => (
        <span className="font-semibold text-slate-700">
          {currency} {formatMoney(l.rate)}
        </span>
      ),
    },
    {
      key: "amount",
      label: "AMOUNT",
      align: "right" as const,
      render: (l) => (
        <span className="font-bold text-slate-900">
          {currency} {formatMoney(l.amount)}
        </span>
      ),
    },
  ];
  return (
    <Table
      columns={columns}
      data={lines}
      getRowId={(l) => l.id}
      showCheckbox={false}
      variant="default"
      emptyMessage="No line items."
      emptyIcon={ScrollText}
    />
  );
};

const Totals: React.FC<{
  rows: { label: string; value: number; strong?: boolean; hide?: boolean }[];
  currency: string;
}> = ({ rows, currency }) => (
  <div className="flex justify-end pt-4">
    <dl className="w-full sm:w-80 text-sm space-y-2">
      {rows
        .filter((r) => !r.hide)
        .map((r) => (
          <div
            key={r.label}
            className={`flex justify-between ${r.strong ? "border-t pt-2 text-base font-bold text-slate-900" : ""}`}
          >
            <dt className={r.strong ? "" : "text-slate-500"}>{r.label}</dt>
            <dd>
              {formatMoney(r.value)} {currency}
            </dd>
          </div>
        ))}
    </dl>
  </div>
);

const Notes: React.FC<{ title: string; html: string }> = ({ title, html }) => (
  <DetailSection title={title}>
    <div
      className="text-sm text-slate-900 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  </DetailSection>
);

const Placeholder: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex h-full min-h-60 items-center justify-center px-6 text-sm text-slate-400">{text}</div>
);

const PRINT_MENU = [
  { label: "Download PDF", onClick: () => window.print() },
  { label: "Print", onClick: () => window.print() },
];


/** Full-width table list (same look as the main app's lists); opening a row switches to the split view. */
export function TableList<T extends { id: number | string }>({
  title,
  statuses,
  status,
  onStatus,
  columns,
  rows,
  loading,
  error,
  empty,
  onOpen,
}: {
  title: (status: string) => string;
  statuses?: string[];
  status: string;
  onStatus: (s: string) => void;
  columns: TableColumn<T>[];
  rows: T[];
  loading: boolean;
  error?: Error;
  empty: string;
  onOpen: (row: T) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pb-8">
      <PageHeader
        title={title(status)}
        dropdown={
          statuses
            ? {
                options: statuses.map((s) => ({ label: title(s), value: s })),
                value: status,
                onChange: onStatus,
                isOpen: open,
                onToggle: () => setOpen(!open),
              }
            : undefined
        }
      />
      <div className="mt-4">
        {error ? (
          <div className="px-2 sm:px-4 md:px-6">
            <ErrorNote message={error.message} />
          </div>
        ) : (
          <Table<T>
            columns={columns}
            data={rows}
            loading={loading}
            emptyMessage={empty}
            getRowId={(r) => String(r.id)}
            onRowClick={onOpen}
            showCheckbox={false}
            className={TABLE_INSET}
          />
        )}
      </div>
    </div>
  );
}

const bold = (v: React.ReactNode) => <span className="font-bold text-gray-900">{v}</span>;
const muted = (v: React.ReactNode) => <span className="text-gray-600">{v}</span>;

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

const INVOICE_STATUSES = ["All", "Sent", "Partially Paid", "Paid", "Overdue", "Written Off"];

export const PortalInvoices: React.FC = () => {
  const router = useRouter();
  const selectedId = useRouteId();
  const { data, error, loading } = usePortalQuery<{ invoices: InvoiceRow[] }>("/invoices");
  const [status, setStatus] = useState("All");
  const rows = useMemo(
    () => (data?.invoices || []).filter((i) => status === "All" || i.status === status),
    [data, status],
  );

  const openInvoice = (row: InvoiceRow) => {
    setNavState(`portal-invoice:${row.id}`, row);
    router.push(`/portal/invoices/${row.id}`);
  };

  if (!selectedId) {
    return (
      <TableList<InvoiceRow>
        title={(s) => (s === "All" ? "All Invoices" : `${s} Invoices`)}
        statuses={INVOICE_STATUSES}
        status={status}
        onStatus={setStatus}
        rows={rows}
        loading={loading}
        error={error}
        empty="No invoices found"
        onOpen={openInvoice}
        columns={[
          { key: "n", label: "INVOICE#", render: (i) => bold(i.invoiceNumber) },
          { key: "d", label: "DATE", render: (i) => muted(formatDate(i.invoiceDate)) },
          { key: "due", label: "DUE DATE", render: (i) => muted(formatDate(i.dueDate)) },
          { key: "t", label: "AMOUNT", render: (i) => bold(`${formatMoney(i.total)} ${i.currency}`) },
          { key: "r", label: "BALANCE", render: (i) => muted(`${formatMoney(i.remaining)} ${i.currency}`) },
          { key: "s", label: "STATUS", render: (i) => <StatusBadge status={i.status} variant={statusVariant(i.status)} /> },
        ]}
      />
    );
  }

  return (
    <SplitView
      filter={{
        value: status,
        options: INVOICE_STATUSES.map((s) => ({ value: s, label: s === "All" ? "All Invoices" : `${s} Invoices` })),
        onChange: setStatus,
      }}
      rows={rows.map((i) => ({
        id: i.id,
        title: i.invoiceNumber,
        subtitle: formatDate(i.invoiceDate),
        right: `${formatMoney(i.total)} ${i.currency}`,
      }))}
      loading={loading}
      selectedId={selectedId}
      hideCheckbox
      onOpen={(id) => {
        const row = rows.find((r) => String(r.id) === String(id));
        if (row) setNavState(`portal-invoice:${id}`, row);
        router.push(`/portal/invoices/${id}`);
      }}
      emptyText={error ? error.message : "No invoices found"}
      detailKey={selectedId}
    >
      {selectedId ? <PortalInvoiceView /> : <Placeholder text="Select an invoice to view its details" />}
    </SplitView>
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
  const id = useRouteId();
  const router = useRouter();
  const { me } = usePortalMe();
  const nav = useNavRecord<InvoiceRow>(id ? `portal-invoice:${id}` : null);
  const { data, error, loading } = usePortalQuery<InvoiceDetail>(id ? `/invoices/${id}` : null);
  const [tab, setTab] = useState<"overview" | "comments">("overview");

  const inv = data?.invoice ?? nav;
  if (!inv) {
    if (error) return <ErrorNote message={error.message || "Invoice not found"} />;
    return loading || !error ? <PageLoading /> : null;
  }
  const full = data?.invoice;
  const payments = data?.payments || [];
  const unpaid = ["Sent", "Partially Paid", "Overdue"].includes(inv.status);
  const subTotal = Number(full?.subTotal ?? inv.total);
  const discount = full ? (Number(full.subTotal) * (full.discountPercent || 0)) / 100 : 0;
  const received = Number(full?.received ?? 0);

  const paymentColumns: TableColumn<InvoiceDetail["payments"][number]>[] = [
    { key: "n", label: "PAYMENT", render: (p) => <span className="font-bold text-slate-900">#{p.paymentNumber ?? p.id}</span> },
    { key: "d", label: "DATE", render: (p) => <span className="text-slate-600">{formatDate(p.date)}</span> },
    { key: "m", label: "METHOD", render: (p) => <span className="text-slate-600">{p.mode}</span> },
    {
      key: "a",
      label: "APPLIED",
      align: "right" as const,
      render: (p) => (
        <span className="font-bold text-slate-900">
          {inv.currency} {formatMoney(p.amount)}
        </span>
      ),
    },
  ];

  return (
    <div id="pdf-print-area" className={DETAIL_WRAP}>
      <DetailHeader
        title={inv.invoiceNumber}
        subtitle={<StatusBadge status={inv.status} variant={statusVariant(inv.status)} />}
        onClose={() => router.push("/portal/invoices")}
        menu={PRINT_MENU}
      />

      <div className="border-b border-slate-200 print:hidden">
        <Tabs
          tabs={[
            { label: "Overview", value: "overview" },
            { label: "Comments", value: "comments" },
          ]}
          activeTab={tab}
          onTabChange={(v) => setTab(v as "overview" | "comments")}
        />
      </div>

      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
            <DetailRow label="Invoice Number">{inv.invoiceNumber}</DetailRow>
            <DetailRow label="Status">{inv.status}</DetailRow>
            <DetailRow label="From">{me?.organization.name}</DetailRow>
            <DetailRow label="Billed To">{me?.customer.displayName}</DetailRow>
            <DetailRow label="Issue Date">{formatDate(inv.invoiceDate)}</DetailRow>
            <DetailRow label="Due Date">{formatDate(inv.dueDate)}</DetailRow>
            <DetailRow label="Currency">{inv.currency}</DetailRow>
            <DetailRow label="Amount Due">
              <span className="font-semibold">
                {formatMoney(inv.remaining)} {inv.currency}
              </span>
            </DetailRow>
          </div>
          {unpaid && (
            <p className="mt-3 text-xs text-slate-500 print:hidden">
              Contact {me?.organization.name} to arrange payment.
            </p>
          )}

          <DetailSection title="Line Items">
            {full ? (
              <>
                <LinesTable lines={full.items || []} currency={inv.currency} />
                <Totals
                  currency={inv.currency}
                  rows={[
                    { label: "Subtotal", value: subTotal },
                    { label: `Discount (${full.discountPercent}%)`, value: -discount, hide: !full.discountPercent },
                    { label: "Total", value: Number(inv.total), strong: true },
                    { label: "Received", value: received, hide: !received },
                    { label: "Balance Due", value: Number(inv.remaining), strong: true, hide: !received },
                  ]}
                />
              </>
            ) : (
              <PageLoading />
            )}
          </DetailSection>

          {full?.notes && <Notes title="Notes & Terms" html={full.notes} />}

          {payments.length > 0 && (
            <DetailSection title="Payments Received">
              <Table
                columns={paymentColumns}
                data={payments}
                getRowId={(p) => p.id}
                showCheckbox={false}
                variant="default"
                emptyMessage="No payments"
                emptyIcon={DollarSign}
                onRowClick={(p) => {
                  setNavState(`portal-payment:${p.id}`, {
                    id: p.id,
                    paymentNumber: p.paymentNumber,
                    date: p.date,
                    mode: p.mode,
                    amount: p.amount,
                    currency: inv.currency,
                  });
                  router.push(`/portal/payments/${p.id}`);
                }}
              />
            </DetailSection>
          )}
        </div>
      )}

      {tab === "comments" && <PortalComments entityType="invoice" entityId={inv.id} />}
    </div>
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

const QUOTE_STATUSES = ["All", "Sent", "Viewed", "Accepted", "Declined", "Expired", "Converted"];

export const PortalQuotes: React.FC = () => {
  const router = useRouter();
  const selectedId = useRouteId();
  const { data, error, loading } = usePortalQuery<{ quotes: QuoteRow[] }>("/quotes");
  const [status, setStatus] = useState("All");
  const rows = useMemo(
    () => (data?.quotes || []).filter((q) => status === "All" || q.status === status),
    [data, status],
  );

  const openQuote = (row: QuoteRow) => {
    setNavState(`portal-quote:${row.id}`, row);
    router.push(`/portal/quotes/${row.id}`);
  };

  if (!selectedId) {
    return (
      <TableList<QuoteRow>
        title={(s) => (s === "All" ? "All Quotes" : `${s} Quotes`)}
        statuses={QUOTE_STATUSES}
        status={status}
        onStatus={setStatus}
        rows={rows}
        loading={loading}
        error={error}
        empty="No quotes found"
        onOpen={openQuote}
        columns={[
          { key: "n", label: "QUOTE#", render: (q) => bold(q.quoteNumber) },
          { key: "d", label: "DATE", render: (q) => muted(formatDate(q.quoteDate)) },
          { key: "e", label: "EXPIRY", render: (q) => muted(formatDate(q.expiryDate)) },
          { key: "t", label: "AMOUNT", render: (q) => bold(`${formatMoney(q.total)} ${q.currency}`) },
          { key: "s", label: "STATUS", render: (q) => <StatusBadge status={q.status} variant={statusVariant(q.status)} /> },
        ]}
      />
    );
  }

  return (
    <SplitView
      filter={{
        value: status,
        options: QUOTE_STATUSES.map((s) => ({ value: s, label: s === "All" ? "All Quotes" : `${s} Quotes` })),
        onChange: setStatus,
      }}
      rows={rows.map((q) => ({
        id: q.id,
        title: q.quoteNumber,
        subtitle: formatDate(q.quoteDate),
        right: `${formatMoney(q.total)} ${q.currency}`,
      }))}
      loading={loading}
      selectedId={selectedId}
      hideCheckbox
      onOpen={(id) => {
        const row = rows.find((r) => String(r.id) === String(id));
        if (row) setNavState(`portal-quote:${id}`, row);
        router.push(`/portal/quotes/${id}`);
      }}
      emptyText={error ? error.message : "No quotes found"}
      detailKey={selectedId}
    >
      {selectedId ? <PortalQuoteView /> : <Placeholder text="Select a quote to view its details" />}
    </SplitView>
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
  const id = useRouteId();
  const router = useRouter();
  const { me } = usePortalMe();
  const nav = useNavRecord<QuoteRow>(id ? `portal-quote:${id}` : null);
  const { data, error, loading, refresh } = usePortalQuery<QuoteDetail>(id ? `/quotes/${id}` : null);
  const [tab, setTab] = useState<"overview" | "comments">("overview");
  const [busy, setBusy] = useState<"" | "accept" | "decline">("");
  const [actionError, setActionError] = useState("");

  const q = data?.quote ?? nav;
  if (!q) {
    if (error) return <ErrorNote message={error.message || "Quote not found"} />;
    return loading || !error ? <PageLoading /> : null;
  }
  const full = data?.quote;
  const expired = q.expiryDate ? new Date(q.expiryDate) < new Date() : false;
  const canRespond = ["Sent", "Viewed"].includes(q.status) && !expired;
  const shownStatus = expired && ["Sent", "Viewed"].includes(q.status) ? "Expired" : q.status;

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
    <div id="pdf-print-area" className={DETAIL_WRAP}>
      <DetailHeader
        title={q.quoteNumber}
        subtitle={<StatusBadge status={shownStatus} variant={statusVariant(shownStatus)} />}
        onClose={() => router.push("/portal/quotes")}
        menu={PRINT_MENU}
        actions={
          canRespond ? (
            <>
              <Button size="sm" variant="danger" disabled={!!busy} onClick={() => respond("decline")} icon={<X className="w-4 h-4" />}>
                Decline
              </Button>
              <Button size="sm" variant="primary" disabled={!!busy} onClick={() => respond("accept")} icon={<Check className="w-4 h-4" />}>
                Accept
              </Button>
            </>
          ) : undefined
        }
      />
      {actionError && <ErrorNote message={actionError} />}

      <div className="border-b border-slate-200 print:hidden">
        <Tabs
          tabs={[
            { label: "Overview", value: "overview" },
            { label: "Comments", value: "comments" },
          ]}
          activeTab={tab}
          onTabChange={(v) => setTab(v as "overview" | "comments")}
        />
      </div>

      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
            <DetailRow label="Quote Number">{q.quoteNumber}</DetailRow>
            <DetailRow label="Status">{shownStatus}</DetailRow>
            <DetailRow label="From">{me?.organization.name}</DetailRow>
            <DetailRow label="Prepared For">{me?.customer.displayName}</DetailRow>
            <DetailRow label="Quote Date">{formatDate(q.quoteDate)}</DetailRow>
            <DetailRow label="Valid Until">{formatDate(q.expiryDate)}</DetailRow>
            <DetailRow label="Currency">{q.currency}</DetailRow>
            {full?.referenceNumber && <DetailRow label="Reference">{full.referenceNumber}</DetailRow>}
            <DetailRow label="Total">
              <span className="font-semibold">
                {formatMoney(q.total)} {q.currency}
              </span>
            </DetailRow>
          </div>

          <DetailSection title="Line Items">
            {full ? (
              <>
                <LinesTable lines={full.items || []} currency={q.currency} />
                <Totals
                  currency={q.currency}
                  rows={[
                    { label: "Subtotal", value: Number(full.subTotal) },
                    { label: `Discount (${full.discountPercent}%)`, value: -Number(full.discount), hide: !Number(full.discount) },
                    { label: "Tax", value: Number(full.tax), hide: !Number(full.tax) },
                    { label: "Shipping", value: Number(full.shipping), hide: !Number(full.shipping) },
                    { label: "Adjustment", value: Number(full.adjustment), hide: !Number(full.adjustment) },
                    { label: "Total", value: Number(full.total), strong: true },
                  ]}
                />
              </>
            ) : (
              <PageLoading />
            )}
          </DetailSection>

          {full?.notes && <Notes title="Notes" html={full.notes} />}
          {full?.terms && (
            <DetailSection title="Terms & Conditions">
              <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">{full.terms}</p>
            </DetailSection>
          )}
        </div>
      )}

      {tab === "comments" && <PortalComments entityType="quote" entityId={q.id} />}
    </div>
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
  invoices?: string[];
}

export const PortalPayments: React.FC = () => {
  const router = useRouter();
  const selectedId = useRouteId();
  const { data, error, loading } = usePortalQuery<{ payments: PaymentRow[] }>("/payments");
  const rows = data?.payments || [];

  const openPayment = (row: PaymentRow) => {
    setNavState(`portal-payment:${row.id}`, row);
    router.push(`/portal/payments/${row.id}`);
  };

  if (!selectedId) {
    return (
      <TableList<PaymentRow>
        title={() => "All Payments"}
        status="all"
        onStatus={() => {}}
        rows={rows}
        loading={loading}
        error={error}
        empty="No payments found"
        onOpen={openPayment}
        columns={[
          { key: "n", label: "PAYMENT#", render: (p) => bold(`#${p.paymentNumber ?? p.id}`) },
          { key: "d", label: "DATE", render: (p) => muted(formatDate(p.date)) },
          { key: "i", label: "INVOICES", render: (p) => muted((p.invoices || []).join(", ") || "—") },
          { key: "m", label: "METHOD", render: (p) => muted(p.mode) },
          { key: "a", label: "AMOUNT", render: (p) => bold(`${formatMoney(p.amount)} ${p.currency}`) },
        ]}
      />
    );
  }

  return (
    <SplitView
      filter={{ value: "all", options: [{ value: "all", label: "All Payments" }], onChange: () => {} }}
      rows={rows.map((p) => ({
        id: p.id,
        title: `Payment #${p.paymentNumber ?? p.id}`,
        subtitle: `${formatDate(p.date)} · ${p.mode}`,
        right: `${formatMoney(p.amount)} ${p.currency}`,
      }))}
      loading={loading}
      selectedId={selectedId}
      hideCheckbox
      onOpen={(id) => {
        const row = rows.find((r) => String(r.id) === String(id));
        if (row) setNavState(`portal-payment:${id}`, row);
        router.push(`/portal/payments/${id}`);
      }}
      emptyText={error ? error.message : "No payments found"}
      detailKey={selectedId}
    >
      {selectedId ? <PortalPaymentView /> : <Placeholder text="Select a payment to view its details" />}
    </SplitView>
  );
};

interface PaymentDetail {
  payment: Omit<PaymentRow, "invoices"> & {
    referenceNo?: string | null;
    notes?: string | null;
    invoices: { id: number; invoiceNumber: string; amount: number }[];
  };
}

export const PortalPaymentView: React.FC = () => {
  const id = useRouteId();
  const router = useRouter();
  const { me } = usePortalMe();
  const nav = useNavRecord<PaymentRow>(id ? `portal-payment:${id}` : null);
  const { data, error, loading } = usePortalQuery<PaymentDetail>(id ? `/payments/${id}` : null);

  const p = data?.payment ?? nav;
  if (!p) {
    if (error) return <ErrorNote message={error.message || "Payment not found"} />;
    return loading || !error ? <PageLoading /> : null;
  }
  const full = data?.payment;

  const appliedColumns: TableColumn<PaymentDetail["payment"]["invoices"][number]>[] = [
    { key: "n", label: "INVOICE", render: (i) => <span className="font-bold text-slate-900">{i.invoiceNumber}</span> },
    {
      key: "a",
      label: "APPLIED",
      align: "right" as const,
      render: (i) => (
        <span className="font-bold text-slate-900">
          {p.currency} {formatMoney(i.amount)}
        </span>
      ),
    },
  ];

  return (
    <div id="pdf-print-area" className={DETAIL_WRAP}>
      <DetailHeader
        title={`Payment #${p.paymentNumber ?? p.id}`}
        subtitle={<span>Received {formatDate(p.date)}</span>}
        onClose={() => router.push("/portal/payments")}
        menu={[
          { label: "Download Receipt", onClick: () => window.print() },
          { label: "Print", onClick: () => window.print() },
        ]}
      />

      <div>
        <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
          <DetailRow label="Payment Number">#{p.paymentNumber ?? p.id}</DetailRow>
          <DetailRow label="Amount">
            <span className="font-semibold">
              {formatMoney(p.amount)} {p.currency}
            </span>
          </DetailRow>
          <DetailRow label="Date">{formatDate(p.date)}</DetailRow>
          <DetailRow label="Method">{p.mode}</DetailRow>
          <DetailRow label="Reference">{full?.referenceNo}</DetailRow>
          <DetailRow label="Received By">{me?.organization.name}</DetailRow>
          <DetailRow label="Received From">{me?.customer.displayName}</DetailRow>
        </div>

        <DetailSection title="Applied To">
          {full ? (
            <Table
              columns={appliedColumns}
              data={full.invoices}
              getRowId={(i) => i.id}
              showCheckbox={false}
              variant="default"
              emptyMessage="Not applied to any invoice"
              emptyIcon={ScrollText}
              onRowClick={(i) => router.push(`/portal/invoices/${i.id}`)}
            />
          ) : (
            <PageLoading />
          )}
        </DetailSection>

        {full?.notes && <Notes title="Notes" html={full.notes} />}
      </div>
    </div>
  );
};
