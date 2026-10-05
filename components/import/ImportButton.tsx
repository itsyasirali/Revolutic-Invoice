"use client";

import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, Plus, X } from "lucide-react";
import axios from "@/lib/axios";
import { Button, toast } from "@/components/ui";
import {
  invalidateCustomers,
  invalidateInvoices,
  invalidateItems,
  invalidatePayments,
  invalidateProjects,
  invalidateQuotes,
} from "@/lib/swr";
import { UNITS, unitOptions } from "@/data/units";
import {
  KIND_ENTITY,
  type ImportDrafts,
  type ImportIssue,
  type ImportKind,
  type RowStatus,
} from "@/lib/import/types";

type Row = Record<string, any>;

interface Col {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "select";
  options?: string[];
  /** Include a blank choice and keep a custom current value. */
  flexible?: boolean;
  w: number;
}

interface Schema {
  label: string;
  cols: Col[];
  nested?: { key: string; label: string; cols: Col[]; blank: Row };
  refresh: () => unknown;
}

const INVOICE_STATUSES = ["Draft", "Sent", "Partially Paid", "Paid", "Overdue", "Cancelled", "Written Off"];

const SCHEMAS: Record<ImportKind, Schema> = {
  contacts: {
    label: "customers",
    refresh: invalidateCustomers,
    cols: [
      { key: "displayName", label: "Display name", w: 160 },
      { key: "companyName", label: "Company", w: 150 },
      { key: "customerType", label: "Type", type: "select", options: ["Business", "Individual"], w: 110 },
      { key: "currency", label: "Currency", w: 80 },
      { key: "status", label: "Status", type: "select", options: ["Active", "inActive"], w: 100 },
      { key: "firstName", label: "First name", w: 110 },
      { key: "lastName", label: "Last name", w: 110 },
      { key: "email", label: "Email", w: 190 },
      { key: "phone", label: "Phone", w: 120 },
      { key: "address", label: "Address", w: 200 },
      { key: "remarks", label: "Notes", w: 180 },
    ],
  },
  items: {
    label: "items",
    refresh: invalidateItems,
    cols: [
      { key: "name", label: "Name", w: 180 },
      { key: "type", label: "Type", type: "select", options: ["Goods", "Service"], w: 100 },
      { key: "unit", label: "Unit", type: "select", options: [...UNITS], flexible: true, w: 100 },
      { key: "sellingPrice", label: "Selling price", type: "number", w: 110 },
      { key: "description", label: "Description", w: 220 },
      { key: "status", label: "Status", type: "select", options: ["Active", "inActive"], w: 100 },
    ],
  },
  projects: {
    label: "projects",
    refresh: invalidateProjects,
    cols: [
      { key: "name", label: "Name", w: 170 },
      { key: "projectNumber", label: "Code", w: 100 },
      { key: "customerName", label: "Customer", w: 150 },
      { key: "status", label: "Status", type: "select", options: ["Active", "On Hold", "Completed"], w: 120 },
      { key: "billingMethod", label: "Billing", type: "select", options: ["Hourly", "Fixed"], w: 100 },
      { key: "hourlyRate", label: "Hourly rate", type: "number", w: 100 },
      { key: "fixedAmount", label: "Fixed amount", type: "number", w: 120 },
      { key: "budgetHours", label: "Budget hours", type: "number", w: 100 },
      { key: "budgetAmount", label: "Budget amount", type: "number", w: 120 },
      { key: "currency", label: "Currency", w: 80 },
      { key: "description", label: "Description", w: 220 },
    ],
  },
  quotes: {
    label: "quotes",
    refresh: invalidateQuotes,
    cols: [
      { key: "quoteNumber", label: "Quote #", w: 120 },
      { key: "customerName", label: "Customer", w: 150 },
      { key: "projectName", label: "Project", w: 140 },
      { key: "quoteDate", label: "Date", type: "date", w: 140 },
      { key: "expiryDate", label: "Expiry date", type: "date", w: 140 },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Sent", "Viewed", "Accepted", "Declined", "Expired"], w: 120 },
      { key: "currency", label: "Currency", w: 80 },
      { key: "referenceNumber", label: "Reference", w: 110 },
      { key: "subTotal", label: "Subtotal", type: "number", w: 100 },
      { key: "discountPercent", label: "Discount %", type: "number", w: 90 },
      { key: "discount", label: "Discount", type: "number", w: 90 },
      { key: "tax", label: "Tax", type: "number", w: 80 },
      { key: "shipping", label: "Shipping", type: "number", w: 90 },
      { key: "adjustment", label: "Adjustment", type: "number", w: 100 },
      { key: "total", label: "Total", type: "number", w: 100 },
      { key: "notes", label: "Notes", w: 200 },
      { key: "terms", label: "Terms", w: 200 },
    ],
    nested: {
      key: "lines",
      label: "Line items",
      blank: { name: "", description: "", itemName: "", quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 },
      cols: [
        { key: "name", label: "Name", w: 180 },
        { key: "description", label: "Description", w: 200 },
        { key: "itemName", label: "Linked item", w: 150 },
        { key: "quantity", label: "Qty", type: "number", w: 80 },
        { key: "rate", label: "Rate", type: "number", w: 100 },
        { key: "discount", label: "Disc %", type: "number", w: 80 },
        { key: "tax", label: "Tax %", type: "number", w: 80 },
        { key: "amount", label: "Amount", type: "number", w: 100 },
      ],
    },
  },
  invoices: {
    label: "invoices",
    refresh: invalidateInvoices,
    cols: [
      { key: "invoiceNumber", label: "Invoice #", w: 120 },
      { key: "customerName", label: "Customer", w: 150 },
      { key: "invoiceDate", label: "Date", type: "date", w: 140 },
      { key: "dueDate", label: "Due date", type: "date", w: 140 },
      { key: "terms", label: "Terms", w: 160 },
      { key: "status", label: "Status", type: "select", options: INVOICE_STATUSES, w: 130 },
      { key: "currency", label: "Currency", w: 80 },
      { key: "subTotal", label: "Subtotal", type: "number", w: 100 },
      { key: "total", label: "Total", type: "number", w: 100 },
      { key: "balance", label: "Balance", type: "number", w: 100 },
      { key: "discountPercent", label: "Discount %", type: "number", w: 90 },
      { key: "recipientEmail", label: "Email", w: 190 },
      { key: "notes", label: "Notes", w: 200 },
    ],
    nested: {
      key: "lines",
      label: "Line items",
      blank: { title: "", description: "", itemName: "", quantity: 1, rate: 0, amount: 0 },
      cols: [
        { key: "title", label: "Title", w: 180 },
        { key: "description", label: "Description", w: 220 },
        { key: "itemName", label: "Linked item", w: 160 },
        { key: "quantity", label: "Qty", type: "number", w: 80 },
        { key: "rate", label: "Rate", type: "number", w: 100 },
        { key: "amount", label: "Amount", type: "number", w: 100 },
      ],
    },
  },
  payments: {
    label: "payments",
    refresh: invalidatePayments,
    cols: [
      { key: "paymentNumber", label: "Payment #", w: 90 },
      { key: "customerName", label: "Customer", w: 150 },
      { key: "paymentDate", label: "Date", type: "date", w: 140 },
      { key: "paymentMode", label: "Mode", w: 140 },
      { key: "referenceNo", label: "Reference", w: 120 },
      { key: "currency", label: "Currency", w: 80 },
      { key: "amount", label: "Amount", type: "number", w: 100 },
      { key: "bankCharges", label: "Bank charges", type: "number", w: 100 },
      { key: "status", label: "Status", w: 90 },
      { key: "notes", label: "Notes", w: 200 },
    ],
    nested: {
      key: "applied",
      label: "Applied to invoices",
      blank: { invoiceNumber: "", amount: 0 },
      cols: [
        { key: "invoiceNumber", label: "Invoice #", w: 140 },
        { key: "amount", label: "Amount applied", type: "number", w: 140 },
      ],
    },
  },
};

const CONTROL =
  "h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const SELECT_STYLE: React.CSSProperties = {
  appearance: "none",
  paddingRight: 30,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 8px center",
  backgroundSize: "16px 16px",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
};

const Field: React.FC<{ col: Col; value: unknown; onChange: (v: string) => void }> = ({
  col,
  value,
  onChange,
}) =>
  col.type === "select" ? (
    <select
      className={CONTROL}
      style={{ minWidth: col.w, ...SELECT_STYLE }}
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
    >
      {col.flexible && <option value="">-</option>}
      {(col.flexible ? unitOptions(String(value ?? "")) : col.options!).map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  ) : (
    <input
      className={CONTROL}
      style={{ minWidth: col.w }}
      type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
      step={col.type === "number" ? "any" : undefined}
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
    />
  );

const errorData = (err: unknown) =>
  (err as { response?: { data?: { message?: string; errors?: ImportIssue[] } } }).response?.data;

/**
 * Imports one CSV export into the list it sits on. The file is mapped to
 * editable records and shown in a preview; nothing is saved until the user
 * confirms, and the edited records are what get saved.
 */
export const ImportButton: React.FC<{ kind: ImportKind }> = ({ kind }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const schema = SCHEMAS[kind];
  const entity = KIND_ENTITY[kind];

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [statuses, setStatuses] = useState<RowStatus[]>([]);
  const [issues, setIssues] = useState<ImportIssue[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const close = () => {
    setOpen(false);
    setRows([]);
    setStatuses([]);
    setIssues([]);
    setWarnings([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append(kind, file);
      form.append("dryRun", "true");
      const { data } = await axios.post("/import", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRows((data.drafts as ImportDrafts)[entity] ?? []);
      setStatuses(data.statuses?.[entity] ?? []);
      setIssues(data.errors ?? []);
      setWarnings(data.warnings ?? []);
      setFileName(file.name);
      setOpen(true);
    } catch (err) {
      toast.error(errorData(err)?.message || "Could not read the file", "Error");
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        "/import",
        { drafts: { [entity]: rows }, dryRun: false },
        { headers: { "Content-Type": "application/json" } },
      );
      const list: RowStatus[] = data.statuses?.[entity] ?? [];
      const created = list.filter((s) => s === "new").length;
      const existed = list.filter((s) => s === "exists").length;
      await schema.refresh();
      toast.success(
        `${created} ${schema.label} imported${existed ? `, ${existed} already existed` : ""}`,
        "Import complete",
      );
      close();
    } catch (err) {
      const data = errorData(err);
      if (data?.errors?.length) {
        setIssues(data.errors);
        setStatuses((prev) => {
          const next = prev.map((s): RowStatus => (s === "error" ? "new" : s));
          data.errors!.forEach((e) => (next[e.index] = "error"));
          return next;
        });
        toast.error("Fix the highlighted problems, then confirm again", "Nothing was saved");
      } else {
        toast.error(data?.message || "Import failed", "Error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Editing a record clears its own previous problem; the server re-validates on confirm.
  const touch = (i: number) => {
    setIssues((prev) => prev.filter((e) => e.index !== i));
    setStatuses((prev) => prev.map((s, idx) => (idx === i && s === "error" ? "new" : s)));
  };

  const setCell = (i: number, key: string, value: string) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
    touch(i);
  };

  const mapNested = (i: number, fn: (list: Row[]) => Row[]) => {
    const n = schema.nested!.key;
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [n]: fn(r[n] ?? []) } : r)));
    touch(i);
  };

  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
    setStatuses((prev) => prev.filter((_, idx) => idx !== i));
    setIssues((prev) =>
      prev.filter((e) => e.index !== i).map((e) => (e.index > i ? { ...e, index: e.index - 1 } : e)),
    );
  };

  const toSave = rows.filter((_, i) => statuses[i] !== "exists").length;
  const existing = rows.length - toSave;
  const colSpan = schema.cols.length + 2;
  const th =
    "sticky top-0 z-10 whitespace-nowrap border-b border-slate-200 bg-white px-1.5 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500";

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <Button
        variant="outline"
        size="sm"
        loading={loading && !open}
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        Import {schema.label}
      </Button>

      {open &&
        createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !loading && close()} />
          <div className="relative z-10 flex max-h-[92vh] w-fit min-w-[min(640px,100%)] max-w-[min(1200px,100%)] flex-col overflow-hidden rounded-b-xl border-x border-b border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-6 border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Import {schema.label}</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Review and edit the records from{" "}
                  <span className="font-medium text-slate-700">{fileName}</span>. Nothing is saved until you
                  confirm.
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">{toSave} to add</span>
                  {existing > 0 && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                      {existing} already exist - skipped
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={close}
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="hide-scrollbar flex-1 space-y-4 overflow-auto px-6 py-4">
              {issues.length > 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <div className="mb-1 font-semibold">Fix these before importing</div>
                  <ul className="list-disc space-y-0.5 pl-5">
                    {issues.map((e, i) => (
                      <li key={i}>{e.message}</li>
                    ))}
                  </ul>
                </div>
              )}
              {warnings.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <div className="mb-1 font-semibold">Notes</div>
                  <ul className="list-disc space-y-0.5 pl-5">
                    {warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {rows.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">No records left to import.</div>
              ) : (
                <table className="w-full border-separate border-spacing-0 text-left">
                  <thead>
                    <tr>
                      <th className={`${th} w-8 pr-3 text-slate-400`}>#</th>
                      {schema.cols.map((c) => (
                        <th key={c.key} className={th}>
                          {c.label}
                        </th>
                      ))}
                      <th className={`${th} w-10`} />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      const st = statuses[i] ?? "new";
                      const rowIssues = issues.filter((e) => e.index === i);
                      const skipped = st === "exists";
                      const cell = "border-b border-slate-100 px-1.5 py-2 align-top";
                      return (
                        <React.Fragment key={i}>
                          <tr className={skipped ? "bg-slate-50 opacity-60" : st === "error" ? "bg-rose-50/50" : ""}>
                            <td className={`${cell} pr-3 pt-4 text-xs text-slate-400`}>{i + 1}</td>
                            {schema.cols.map((c) => (
                              <td key={c.key} className={cell}>
                                <Field col={c} value={row[c.key]} onChange={(v) => setCell(i, c.key, v)} />
                              </td>
                            ))}
                            <td className={`${cell} text-center`}>
                              <button
                                type="button"
                                title="Remove from import"
                                className="mt-0.5 rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                onClick={() => removeRow(i)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                          {(skipped || rowIssues.length > 0) && (
                            <tr>
                              <td />
                              <td colSpan={colSpan - 1} className="pb-2 pl-1.5 text-xs">
                                {skipped && <span className="text-slate-500">Already exists - will be skipped.</span>}
                                {rowIssues.length > 0 && (
                                  <span className="text-rose-600">{rowIssues.map((e) => e.message).join(" / ")}</span>
                                )}
                              </td>
                            </tr>
                          )}
                          {schema.nested && (
                            <tr>
                              <td />
                              <td colSpan={colSpan - 1} className="border-b border-slate-100 pb-3 pl-1.5">
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                    {schema.nested.label} ({(row[schema.nested.key] ?? []).length})
                                  </div>
                                  <table className="border-separate border-spacing-y-1.5">
                                    <thead>
                                      <tr className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                        {schema.nested.cols.map((c) => (
                                          <th key={c.key} className="px-1 text-left">
                                            {c.label}
                                          </th>
                                        ))}
                                        <th />
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(row[schema.nested.key] ?? []).map((line: Row, j: number) => (
                                        <tr key={j}>
                                          {schema.nested!.cols.map((c) => (
                                            <td key={c.key} className="px-1">
                                              <Field
                                                col={c}
                                                value={line[c.key]}
                                                onChange={(v) =>
                                                  mapNested(i, (list) =>
                                                    list.map((l, k) => (k === j ? { ...l, [c.key]: v } : l)),
                                                  )
                                                }
                                              />
                                            </td>
                                          ))}
                                          <td className="px-1">
                                            <button
                                              type="button"
                                              title="Remove"
                                              className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                              onClick={() => mapNested(i, (list) => list.filter((_, k) => k !== j))}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <button
                                    type="button"
                                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                    onClick={() => mapNested(i, (list) => [...list, { ...schema.nested!.blank }])}
                                  >
                                    <Plus className="h-3.5 w-3.5" /> Add
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-3">
              <Button variant="outline" size="sm" onClick={close} disabled={loading}>
                Cancel
              </Button>
              <Button size="sm" onClick={confirm} loading={loading} disabled={loading || toSave === 0}>
                Confirm import ({toSave})
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default ImportButton;
