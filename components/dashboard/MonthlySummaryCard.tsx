"use client";

import React from "react";
import {
  BarChart3,
  Wallet,
  Receipt,
  TrendingUp,
  FileCheck,
  ArrowUpRight,
} from "lucide-react";
import type { MonthlySummaryMetric } from "@/types/dashboard";

interface MonthlySummaryCardProps {
  metrics: MonthlySummaryMetric[];
}

const MonthlySummaryCard = ({ metrics }: MonthlySummaryCardProps) => {
  const getIconForType = (type: MonthlySummaryMetric["type"]) => {
    switch (type) {
      case "income":
        return {
          icon: Wallet,
          bg: "bg-blue-50 text-[#1E6BFF]",
        };
      case "expenses":
        return {
          icon: Receipt,
          bg: "bg-rose-50 text-rose-600",
        };
      case "netProfit":
        return {
          icon: TrendingUp,
          bg: "bg-emerald-50 text-emerald-600",
        };
      case "invoicesPaid":
      default:
        return {
          icon: FileCheck,
          bg: "bg-purple-50 text-purple-600",
        };
    }
  };

  return (
    <div className="bg-white rounded-md p-5 border border-slate-200/80 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-md bg-blue-50 text-[#1E6BFF] flex items-center justify-center shrink-0">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Monthly Summary
          </h2>
          <p className="text-xs text-slate-400">Compared to last month</p>
        </div>
      </div>

      {/* Metrics List */}
      <div className="space-y-2 flex-1 flex flex-col justify-between">
        {metrics.map((m) => {
          const config = getIconForType(m.type);
          const IconComp = config.icon;

          return (
            <div
              key={m.label}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}
                >
                  <IconComp className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {m.label}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-900">
                  {m.value}
                </span>
                <span className="inline-flex items-center text-[11px] font-semibold text-emerald-500">
                  <ArrowUpRight className="w-3 h-3" />
                  {m.changePercent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlySummaryCard;
