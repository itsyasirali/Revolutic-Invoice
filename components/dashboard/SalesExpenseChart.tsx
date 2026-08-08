"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HelpCircle, ChevronDown, RefreshCw } from "lucide-react";
import { useSalesExpenses } from "@/hooks/invoices/useSalesExpenses";

type PeriodPreset = "This Fiscal Year" | "This Year" | "This Quarter";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
  }).format(value);

type TickProps = { x?: number; y?: number; payload?: { value?: string } };

const CustomXAxisTick = ({ x = 0, y = 0, payload }: TickProps) => (
  <g transform={`translate(${x},${y})`}>
    <text x={0} y={0} dy={16} textAnchor="middle" fill="#9ca3af" fontSize="11">
      {payload?.value}
    </text>
    <text x={0} y={0} dy={28} textAnchor="middle" fill="#d1d5db" fontSize="10">
      2025
    </text>
  </g>
);

export type SalesExpensesData = {
  data: { month: string; sales: number; expenses: number; receipts: number }[];
  totals: { sales: number; receipts: number; expenses: number };
};

type DotRenderProps = {
  cx?: number;
  cy?: number;
  index?: number;
  value?: number;
};

const makePeakDotRenderer =
  (color: string, peakIndex: number) =>
  ({ cx, cy, index, value }: DotRenderProps) => {
    if (index !== peakIndex || cx === undefined || cy === undefined || value === undefined) {
      return <g key={index} />;
    }
    return <circle key={index} cx={cx} cy={cy} r={7} fill={color} stroke="#fff" strokeWidth={2} />;
  };

const getPeakIndex = (data: { value: number }[]) =>
  data.reduce((maxIdx, item, idx, arr) => (item.value > arr[maxIdx].value ? idx : maxIdx), 0);

const SalesExpensesChart = ({ initialData }: { initialData: SalesExpensesData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodPreset>("This Fiscal Year");
  const { data, totals } = initialData;

  const salesPeakIndex = getPeakIndex(data.map((d) => ({ value: d.sales })));
  const expensesPeakIndex = getPeakIndex(data.map((d) => ({ value: d.expenses })));

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-4 mx-auto w-[97%]">
      <div className="flex xs:flex-row justify-between bg-gray-100 mb-10 items-start xs:items-center gap-2 p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-normal text-gray-900">Sales and Expenses</h2>
          <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </div>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            onClick={() =>
              setSelectedPeriod((p) =>
                p === "This Fiscal Year"
                  ? "This Year"
                  : p === "This Year"
                    ? "This Quarter"
                    : "This Fiscal Year"
              )
            }
          >
            <span>{selectedPeriod}</span>
            <ChevronDown className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>

      <div className="flex xs:flex-col sm:flex-row justify-between gap-2 p-3">
        <div className="xs:w-full sm:w-[80%]">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 10 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={<CustomXAxisTick />} axisLine={false} tickLine={false} height={60} />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => (v === 0 ? "0" : `${(v / 1000).toFixed(1)} K`)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                formatter={(v, l) => [formatCurrency(Number(v) || 0), String(l)]}
              />
              <Area
                type="natural"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={2.5}
                fill="url(#expensesGradient)"
                dot={makePeakDotRenderer("#ef4444", expensesPeakIndex)}
                activeDot={{ r: 5, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
              />
              <Area
                type="natural"
                dataKey="sales"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#salesGradient)"
                dot={makePeakDotRenderer("#2563eb", salesPeakIndex)}
                activeDot={{ r: 5, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col sm:w-1/5 justify-between xs:items-center sm:items-end gap-4 sm:mr-6">
          <div className="text-center">
            <div className="text-sm text-primary mb-1 font-normal">Total Sales</div>
            <div className="text-xl sm:text-2xl font-normal text-gray-900">
              {formatCurrency(totals.sales)}
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-sm text-green-600 mb-1 font-normal">Total Receipts</div>
            <div className="text-xl sm:text-2xl font-normal text-gray-900">
              {formatCurrency(totals.receipts)}
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-sm text-red-600 mb-1 font-normal">Total Expenses</div>
            <div className="text-xl sm:text-2xl font-normal text-gray-900">
              {formatCurrency(totals.expenses)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesExpensesChart;
