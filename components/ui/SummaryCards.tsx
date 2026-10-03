"use client";

import React from "react";
import { Card } from "./Card";

export interface SummaryCardItem {
  label: string;
  value: React.ReactNode;
  hint?: string;
}

/** Row of KPI cards built on the shared Card component. */
export const SummaryCards: React.FC<{ items: SummaryCardItem[] }> = ({ items }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-2 sm:px-4 md:px-6">
    {items.map((item) => (
      <Card key={item.label} padding="sm">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {item.label}
        </p>
        <p className="mt-1.5 text-lg font-bold text-slate-900 tracking-tight break-words">
          {item.value}
        </p>
        {item.hint && <p className="mt-0.5 text-xs text-slate-500">{item.hint}</p>}
      </Card>
    ))}
  </div>
);

export default SummaryCards;
