"use client";

import React from "react";
import {
  ScrollText,
  Wallet,
  Clock,
  MinusCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { MetricCardsProps } from "@/types/dashboard";

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
  const formatAmount = (num: number, currency?: string) => {
    const symbol = currency || kpis.totalInvoices.currency || "Rs";
    return `${symbol} ${num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const cards = [
    {
      label: kpis.totalInvoices.label,
      value: formatAmount(
        kpis.totalInvoices.amount,
        kpis.totalInvoices.currency,
      ),
      change: `${kpis.totalInvoices.changePercent}%`,
      isUp: kpis.totalInvoices.isIncrease,
      period: kpis.totalInvoices.periodLabel,
      icon: ScrollText,
      tint: "from-blue-50",
      blob: "bg-blue-400",
      iconBg: "from-blue-500 to-blue-600",
      glow: "shadow-blue-500/25",
      sparkColor: "#1AA3FF",
    },
    {
      label: kpis.totalPayments.label,
      value: formatAmount(
        kpis.totalPayments.amount,
        kpis.totalPayments.currency,
      ),
      change: `${kpis.totalPayments.changePercent}%`,
      isUp: kpis.totalPayments.isIncrease,
      period: kpis.totalPayments.periodLabel,
      icon: Wallet,
      tint: "from-cyan-50",
      blob: "bg-cyan-400",
      iconBg: "from-cyan-500 to-cyan-600",
      glow: "shadow-cyan-500/25",
      sparkColor: "#06B6D4",
    },
    {
      label: kpis.pendingInvoices.label,
      value: formatAmount(
        kpis.pendingInvoices.amount,
        kpis.pendingInvoices.currency,
      ),
      change: `${kpis.pendingInvoices.changePercent}%`,
      isUp: kpis.pendingInvoices.isIncrease,
      period: kpis.pendingInvoices.periodLabel,
      icon: Clock,
      tint: "from-amber-50",
      blob: "bg-amber-400",
      iconBg: "from-amber-500 to-amber-600",
      glow: "shadow-amber-500/25",
      sparkColor: "#F59E0B",
    },
    {
      label: kpis.totalExpenses.label,
      value: formatAmount(
        kpis.totalExpenses.amount,
        kpis.totalExpenses.currency,
      ),
      change: `${kpis.totalExpenses.changePercent}%`,
      isUp: kpis.totalExpenses.isIncrease,
      period: kpis.totalExpenses.periodLabel,
      icon: MinusCircle,
      tint: "from-rose-50",
      blob: "bg-rose-400",
      iconBg: "from-rose-500 to-rose-600",
      glow: "shadow-rose-500/25",
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
            className={`group relative overflow-hidden rounded-md p-5 border border-slate-200/70 bg-gradient-to-br ${card.tint} to-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between`}
          >
            {/* Decorative Color Blob */}
            <div
              className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${card.blob} blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none`}
            />

            {/* Top Icon Box */}
            <div className="relative mb-3 flex items-start justify-between">
              <div
                className={`w-12 h-12 rounded-md bg-gradient-to-br ${card.iconBg} text-white flex items-center justify-center shadow-lg ${card.glow}`}
              >
                <IconComp className="w-6 h-6" />
              </div>
              <div className="relative space-y-1 text-right">
                <span className="text-xs font-semibold text-slate-500 block">
                  {card.label}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </h3>
              </div>
            </div>

            {/* Bottom Row: Trend + Sparkline */}
            <div className="relative flex items-center justify-between mt-4 pt-1">
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
