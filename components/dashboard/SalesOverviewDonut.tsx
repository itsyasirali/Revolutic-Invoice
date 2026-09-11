"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { SalesOverviewData } from "@/types/dashboard";

interface SalesOverviewDonutProps {
  data: SalesOverviewData;
}

const SalesOverviewDonut = ({ data }: SalesOverviewDonutProps) => {
  const { totalSales, segments } = data;

  const isAllZero = totalSales === 0;

  const pieData = isAllZero
    ? [{ name: "No Sales", value: 1, color: "#F1F5F9" }]
    : [
        {
          name: segments.paid.label,
          value: segments.paid.amount,
          percentage: segments.paid.percentage,
          color: segments.paid.color,
        },
        {
          name: segments.partial.label,
          value: segments.partial.amount,
          percentage: segments.partial.percentage,
          color: segments.partial.color,
        },
        {
          name: segments.unpaid.label,
          value: segments.unpaid.amount,
          percentage: segments.unpaid.percentage,
          color: segments.unpaid.color,
        },
      ];

  return (
    <div className="bg-white rounded-md p-5 border border-slate-200/80  flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Sales Overview
        </h2>
      </div>

      {/* Donut Chart with Center Stats */}
      <div className="relative w-full h-52 flex items-center justify-center my-2 [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={62}
              outerRadius={84}
              paddingAngle={isAllZero ? 0 : 3}
              dataKey="value"
              stroke="none"
              cornerRadius={isAllZero ? 0 : 4}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {!isAllZero && (
              <Tooltip
                formatter={(value) => [
                  `Rs ${Number(value || 0).toLocaleString()}`,
                  "Amount",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #1AA3FF",
                  boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        {/* Donut Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] font-medium text-slate-400">
            Total Sales
          </span>
          <span className="text-lg font-bold text-slate-900 leading-tight">
            Rs {totalSales.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Bottom Segment Breakdown */}
      <div className="flex items-center justify-around text-xs pt-3 border-t border-slate-50 gap-2">
        {/* Paid */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-slate-700">Paid </span>
            <span className="text-slate-400">{segments.paid.percentage}%</span>
            <span className="block text-[10px] text-slate-500 font-medium">
              Rs {segments.paid.amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Partial */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-slate-700">Partial </span>
            <span className="text-slate-400">
              {segments.partial.percentage}%
            </span>
            <span className="block text-[10px] text-slate-500 font-medium">
              Rs {segments.partial.amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Unpaid */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-slate-700">Unpaid </span>
            <span className="text-slate-400">
              {segments.unpaid.percentage}%
            </span>
            <span className="block text-[10px] text-slate-500 font-medium">
              Rs {segments.unpaid.amount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOverviewDonut;
