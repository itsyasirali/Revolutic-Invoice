"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RevenueOverviewChartProps, CustomTooltipProps } from "@/types/dashboard";

const PERIODS = [
  { label: "1M", months: 1 },
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "12M", months: 12 },
] as const;

const CustomTooltip = ({ active, payload, label, currency = "Rs" }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-xl border border-slate-100 text-xs min-w-[130px] animate-reveal">
        <p className="font-semibold text-slate-700 mb-1.5 pb-1 border-b border-slate-100">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 text-[11px] py-0.5"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-500">{entry.name}</span>
            </div>
            <span className="font-bold text-slate-800">
              {currency} {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const RevenueOverviewChart = ({
  data,
  weeklyData = [],
  currency = "Rs",
}: RevenueOverviewChartProps) => {
  const [activePeriod, setActivePeriod] = useState<number>(6);

  const isWeekly = activePeriod === 1;

  const visibleData = useMemo(() => {
    if (isWeekly) return weeklyData;
    return data.slice(Math.max(data.length - activePeriod, 0));
  }, [data, weeklyData, activePeriod, isWeekly]);

  const periodLabel =
    PERIODS.find((p) => p.months === activePeriod)?.label || "6M";

  return (
    <div className="bg-white rounded-md p-5 border border-slate-200/80 shadow-[0_2px_12px_rgb(0,0,0,0.03)] flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Revenue Overview
          </h2>
          <p className="text-xs text-slate-400">
            Total Income vs Expenses (
            {isWeekly ? "This Month by Week" : `Last ${periodLabel}`})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span>Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span>Expenses</span>
            </div>
          </div>

          {/* Period Filter */}
          <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-200/70">
            {PERIODS.map((period) => (
              <button
                key={period.label}
                type="button"
                onClick={() => setActivePeriod(period.months)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  activePeriod === period.months
                    ? "bg-white text-primary shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-64 sm:h-72 mt-2 select-none [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none [&_.recharts-bar-rectangle]:!outline-none [&_path]:!outline-none [&_rect]:!outline-none [&_*]:focus:!outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={visibleData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={4}
          >
            <defs>
              <linearGradient id="incomeBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                <stop offset="100%" stopColor="#93C5FD" stopOpacity={0.9} />
              </linearGradient>
              <linearGradient id="expenseBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={1} />
                <stop offset="100%" stopColor="#FCA5A5" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              tickFormatter={(v) => `${currency} ${v.toLocaleString()}`}
            />
            <Tooltip
              cursor={false}
              content={<CustomTooltip currency={currency} />}
            />
            <Bar
              name="Income"
              dataKey="income"
              fill="url(#incomeBarGrad)"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              name="Expenses"
              dataKey="expenses"
              fill="url(#expenseBarGrad)"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueOverviewChart;
