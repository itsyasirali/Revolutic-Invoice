"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { MoreHorizontal } from "lucide-react";

export type SalesExpensesData = {
  data: { month: string; sales: number; expenses: number; receipts: number }[];
  totals: { sales: number; receipts: number; expenses: number };
};

interface PayloadEntry {
  color: string;
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: PayloadEntry[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#27293D] text-white p-3 rounded-md shadow-xl text-xs font-medium border border-gray-700 min-w-[130px]">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-2 last:mb-0">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="text-gray-300">{entry.name}:</span>
            <span className="font-semibold text-white ml-auto">
              {(entry.value / 1000).toFixed(1)}K
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SalesExpensesChart = ({
  initialData,
}: {
  initialData: SalesExpensesData;
}) => {
  const { data, totals } = initialData;
  const receivable = totals.sales - totals.receipts;

  const pieData = [
    { name: "Total", value: totals.sales, color: "#2563eb" },
    { name: "Received", value: totals.receipts, color: "#06b6d4" },
    { name: "Receivable", value: receivable, color: "#ef4444" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
      {/* Left Card: Revenue */}
      <div className="lg:col-span-2 bg-white rounded-md shadow-sm border border-gray-100 p-6 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-[17px] font-medium text-gray-800">Revenue</h2>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-between items-end mb-8 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-[15px] text-gray-700">Total Profit</span>
            <span className="text-[15px] font-medium text-blue-500">
              {(totals.sales - totals.expenses).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span>
              Income
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
              Expenses
            </div>
          </div>
        </div>

        <div className="flex-1 w-full min-h-[280px] [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none [&_*:focus]:!outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              style={{ outline: "none" }}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="expenseGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#d1d5db",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
              />
              <Area
                name="Income"
                type="monotone"
                dataKey="sales"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#incomeGradient)"
                activeDot={{
                  r: 6,
                  fill: "#2563eb",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
              <Area
                name="Expenses"
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={2.5}
                fill="url(#expenseGradient)"
                activeDot={{
                  r: 6,
                  fill: "#ef4444",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right Card: Income vs Expense */}
      <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6 flex flex-col">
        <h2 className="text-[17px] font-medium text-gray-800 mb-8">
          Sales Overview
        </h2>

        <div className="relative flex-1 flex flex-col justify-center items-center min-h-[250px] [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none [&_*:focus]:!outline-none">
          <div className="absolute inset-0 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart style={{ outline: "none" }}>
                <Pie
                  data={pieData}
                  innerRadius={75}
                  outerRadius={95}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(
                    value:
                      | number
                      | string
                      | readonly (number | string)[]
                      | undefined,
                  ) => {
                    const val = Array.isArray(value) ? value[0] : value;
                    return `${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                  }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col items-center justify-center z-10 pointer-events-none mt-2">
            <span className="text-[#8492a6] text-[15px] font-normal">
              Total Sales
            </span>
            <span className="text-[#3c4858] text-[20px] font-semibold mt-1">
              $
              {totals.sales.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>

        <div className="flex justify-center items-center gap-5 text-[13px] font-medium text-gray-600 mt-6">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              ></span>
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesExpensesChart;
