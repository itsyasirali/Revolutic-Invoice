"use client";

import React from "react";

export const InfoCard: React.FC<{
  title: string;
  children: React.ReactNode;
  columns?: 2 | 3;
}> = ({ title, children, columns = 3 }) => (
  <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
    <h2 className="text-base font-bold text-slate-900 tracking-tight mb-4">{title}</h2>
    <div
      className={`grid grid-cols-1 ${columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}
    >
      {children}
    </div>
  </div>
);

export const InfoField: React.FC<{
  label: string;
  children?: React.ReactNode;
  wide?: boolean;
}> = ({ label, children, wide }) => (
  <div
    className={`p-4 bg-slate-50/70 rounded-lg border border-slate-100 ${wide ? "md:col-span-full" : ""}`}
  >
    <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
    <div className="text-sm font-semibold text-slate-900 leading-relaxed break-words">
      {children || <span className="text-slate-400 font-normal">-</span>}
    </div>
  </div>
);

export interface ActivityEntry {
  label: string;
  at?: string | Date | null;
}

export const ActivityList: React.FC<{ entries: ActivityEntry[] }> = ({ entries }) => (
  <ol className="relative border-l border-slate-200 ml-2 space-y-4">
    {entries
      .filter((e) => e.at)
      .map((e) => (
        <li key={e.label} className="ml-4">
          <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-primary/80 border-2 border-white" />
          <p className="text-sm font-semibold text-slate-900">{e.label}</p>
          <p className="text-xs text-slate-500">{new Date(String(e.at)).toLocaleString()}</p>
        </li>
      ))}
  </ol>
);

/** Label / value line of a detail "Overview" (Zoho-style, no boxes). */
export const DetailRow: React.FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) => (
  <div className="flex gap-6 py-2 text-sm">
    <div className="w-40 shrink-0 text-slate-500">{label}</div>
    <div className="min-w-0 break-words text-slate-900">
      {children || <span className="text-slate-400">-</span>}
    </div>
  </div>
);

/** Titled block of an Overview. */
export const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mt-8">
    <h3 className="mb-2 text-base font-medium text-slate-900">{title}</h3>
    {children}
  </section>
);
