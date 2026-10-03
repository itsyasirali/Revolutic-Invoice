"use client";

import React from "react";
import { Home, ChevronRight } from "lucide-react";
import { OrgLink as Link } from "@/components/organization/OrgLink";

/** Breadcrumb used on detail pages (same markup as the Item/Customer details). */
export const DetailBreadcrumb: React.FC<{
  section: string;
  href: string;
  current: string;
}> = ({ section, href, current }) => (
  <nav className="flex items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
    <Link
      href="/dashboard"
      className="text-primary hover:text-primary/80 transition-colors flex items-center"
      title="Dashboard"
    >
      <Home className="w-4 h-4" />
    </Link>
    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
    <Link
      href={href}
      className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
    >
      {section}
    </Link>
    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
    <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">{current}</span>
  </nav>
);

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
