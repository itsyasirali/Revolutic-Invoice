"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge, LoadingSpinner } from "@/components/ui";
import { statusVariant } from "@/lib/statusVariants";
import { formatMoney } from "@/lib/format";

/* Portal typography scale: title 24/28, section 18/24, card title 15/20, body 14/20,
   table 13/18, meta 12/16, KPI 26-30. */

/** Left inset for the first column so full-width tables line up with the padded page header. */
export const TABLE_INSET =
  "[&_th:first-child]:pl-2 [&_td:first-child]:pl-2 sm:[&_th:first-child]:pl-4 sm:[&_td:first-child]:pl-4 md:[&_th:first-child]:pl-6 md:[&_td:first-child]:pl-6";

export const PageTitle: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}> = ({ title, subtitle, actions, back }) => (
  <div className="mb-6 print:mb-4">
    {back && (
      <Link href={back.href} className="text-xs text-primary hover:underline print:hidden">
        ← {back.label}
      </Link>
    )}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0 print:hidden">{actions}</div>}
    </div>
  </div>
);

export const PCard: React.FC<{
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, actions, children, className = "" }) => (
  <section className={`bg-white rounded-md border border-slate-200/80 p-5 print:border-0 print:p-0 ${className}`}>
    {(title || actions) && (
      <div className="flex items-center justify-between mb-4">
        {title && <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>}
        {actions}
      </div>
    )}
    {children}
  </section>
);

export const Stat: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "default" | "danger" | "success";
}> = ({ label, value, hint, tone = "default" }) => (
  <div className="bg-white rounded-md border border-slate-200/70 shadow-sm p-5">
    <p className="text-xs font-semibold text-slate-500">{label}</p>
    <p
      className={`mt-2 text-[26px] leading-8 font-bold tracking-tight ${
        tone === "danger" ? "text-rose-600" : tone === "success" ? "text-emerald-600" : "text-slate-900"
      }`}
    >
      {value}
    </p>
    {hint && <p className="mt-1 text-[12px] leading-4 text-slate-500">{hint}</p>}
  </div>
);

export const Money: React.FC<{ amount: unknown; currency?: string; className?: string }> = ({
  amount,
  currency,
  className = "",
}) => (
  <span className={`tabular-nums ${className}`}>
    {formatMoney(amount)} {currency}
  </span>
);

export const Status: React.FC<{ status: string }> = ({ status }) => (
  <StatusBadge status={status} variant={statusVariant(status)} />
);

export const PageLoading: React.FC = () => (
  <div className="flex justify-center py-20">
    <LoadingSpinner />
  </div>
);

export const ErrorNote: React.FC<{ message: string }> = ({ message }) => (
  <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">{message}</div>
);

export const Empty: React.FC<{ message: string }> = ({ message }) => (
  <p className="py-10 text-center text-[14px] text-slate-500">{message}</p>
);

export interface PColumn<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  render: (row: T) => React.ReactNode;
}

/** Compact responsive table (13px text); rows are links when `href` is provided. */
export function PTable<T>({
  columns,
  rows,
  getId,
  href,
  empty,
}: {
  columns: PColumn<T>[];
  rows: T[];
  getId: (row: T) => string | number;
  href?: (row: T) => string;
  empty: string;
}) {
  const router = useRouter();
  if (rows.length === 0) return <Empty message={empty} />;
  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-[13px] leading-[18px]">
        <thead>
          <tr className="border-b border-slate-200 text-left text-[12px] uppercase tracking-wide text-slate-500">
            {columns.map((c) => (
              <th key={c.key} className={`py-2.5 pr-4 font-semibold ${c.align === "right" ? "text-right" : ""}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getId(row)}
              onClick={href ? () => router.push(href(row)) : undefined}
              className={`border-b border-slate-100 last:border-0 ${href ? "cursor-pointer hover:bg-slate-50" : ""}`}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`py-3 pr-4 text-slate-700 ${c.align === "right" ? "text-right" : ""}`}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const FilterRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-4 print:hidden">{children}</div>
);

export const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

export const primaryBtn =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors";

export const outlineBtn =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-slate-300 bg-white text-slate-700 text-[13px] font-semibold hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors";

export const dangerBtn =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-rose-200 bg-white text-rose-600 text-[13px] font-semibold hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors";
