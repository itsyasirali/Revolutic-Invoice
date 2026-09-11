"use client";

import React from "react";
import {
  FileText,
  Wallet,
  Clock,
  MinusCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { DashboardKPIs } from "@/types/dashboard";

interface MetricCardsProps {
  kpis: DashboardKPIs;
}

const MiniBarChart = ({ color }: { color: string }) => {
  const heights = ["40%", "70%", "50%", "90%", "65%"];
  return (
    <div className="flex items-end gap-1 h-7">
      {heights.map((h, i) => (
        <div
          key={i}
          style={{ height: h, backgroundColor: color }}
          className="w-1 rounded-t-sm transition-all duration-300"
        />
      ))}
    </div>
  );
};

const MetricCards = ({ kpis }: MetricCardsProps) => {
  const formatAmount = (num: number) => {
    return `Rs ${num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const cards = [
    {
      label: kpis.totalInvoices.label,
      value: formatAmount(kpis.totalInvoices.amount),
      change: `${kpis.totalInvoices.changePercent}%`,
      isUp: kpis.totalInvoices.isIncrease,
      period: kpis.totalInvoices.periodLabel,
      icon: FileText,
      iconBg: "bg-primary",
      sparkColor: "#1E6BFF",
    },
    {
      label: kpis.totalPayments.label,
      value: formatAmount(kpis.totalPayments.amount),
      change: `${kpis.totalPayments.changePercent}%`,
      isUp: kpis.totalPayments.isIncrease,
      period: kpis.totalPayments.periodLabel,
      icon: Wallet,
      iconBg: "bg-[#06B6D4]",
      sparkColor: "#06B6D4",
    },
    {
      label: kpis.pendingInvoices.label,
      value: formatAmount(kpis.pendingInvoices.amount),
      change: `${kpis.pendingInvoices.changePercent}%`,
      isUp: kpis.pendingInvoices.isIncrease,
      period: kpis.pendingInvoices.periodLabel,
      icon: Clock,
      iconBg: "bg-[#F59E0B]",
      sparkColor: "#F59E0B",
    },
    {
      label: kpis.totalExpenses.label,
      value: formatAmount(kpis.totalExpenses.amount),
      change: `${kpis.totalExpenses.changePercent}%`,
      isUp: kpis.totalExpenses.isIncrease,
      period: kpis.totalExpenses.periodLabel,
      icon: MinusCircle,
      iconBg: "bg-[#EF4444]",
      sparkColor: "#EF4444",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const IconComp = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-md p-5 border border-slate-200/80  hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all duration-200 flex flex-col justify-between"
          >
            {/* Top Icon Box */}
            <div className="mb-3">
              <div
                className={`w-10 h-10 rounded-md ${card.iconBg} text-white flex items-center justify-center shadow-xs`}
              >
                <IconComp className="w-5 h-5" />
              </div>
            </div>

            {/* Label & Main Amount */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500">
                {card.label}
              </span>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </h3>
            </div>

            {/* Bottom Row: Trend + Sparkline */}
            <div className="flex items-center justify-between mt-4 pt-1">
              <div className="flex items-center gap-1 text-xs">
                <span
                  className={`inline-flex items-center font-semibold ${
                    card.isUp ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {card.isUp ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {card.change}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {card.period}
                </span>
              </div>

              <MiniBarChart color={card.sparkColor} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricCards;
