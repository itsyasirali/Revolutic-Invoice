"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RevenuePoint } from "@/types/dashboard";

interface RevenueOverviewChartProps {
  data: RevenuePoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
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
              Rs {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const RevenueOverviewChart = ({ data }: RevenueOverviewChartProps) => {
  return (
    <div className="bg-white rounded-md p-5 border border-slate-200/80 shadow-[0_2px_12px_rgb(0,0,0,0.03)] flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Revenue Overview
          </h2>
          <p className="text-xs text-slate-400">
            Income vs Expenses (Last 6 Months)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span>Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span>Expenses</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-64 sm:h-72 mt-2 [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="incomeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E6BFF" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#1E6BFF" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="expenseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.16} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.01} />
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
              tickFormatter={(v) => `Rs ${v.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              name="Income"
              type="monotone"
              dataKey="income"
              stroke="#1E6BFF"
              strokeWidth={2.5}
              fill="url(#incomeAreaGrad)"
              activeDot={{
                r: 5,
                fill: "#1E6BFF",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
              dot={{
                r: 3,
                fill: "#1E6BFF",
                stroke: "#FFFFFF",
                strokeWidth: 1.5,
              }}
            />
            <Area
              name="Expenses"
              type="monotone"
              dataKey="expenses"
              stroke="#EF4444"
              strokeWidth={2.5}
              fill="url(#expenseAreaGrad)"
              activeDot={{
                r: 5,
                fill: "#EF4444",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
              dot={{
                r: 3,
                fill: "#EF4444",
                stroke: "#FFFFFF",
                strokeWidth: 1.5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueOverviewChart;
