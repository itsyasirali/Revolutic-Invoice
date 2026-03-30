import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HelpCircle, ChevronDown, RefreshCw } from "lucide-react";
import { useSalesExpenses } from "../../hooks/invoices/useSalesExpenses";

type PeriodPreset = "This Fiscal Year" | "This Year" | "This Quarter";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
  }).format(value);

type TickProps = { x?: number; y?: number; payload?: { value?: string } };

export default function SalesExpensesChart() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodPreset>("This Fiscal Year");
  const { data, totals, loading, refetch } = useSalesExpenses();

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

          <button
            disabled={loading}
            onClick={refetch}
            className="p-2 rounded-full hover:bg-white text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex xs:flex-col sm:flex-row justify-between gap-2 p-3">
        <div className="xs:w-full sm:w-[80%]">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 10 }}>
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
                formatter={(v: number, l: string) => [formatCurrency(v), l]}
              />
              <Line type="monotone" dataKey="sales" stroke="#075056" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="receipts" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col sm:w-1/5 justify-between xs:items-center sm:items-end gap-4 sm:mr-6">
          <div className="text-center">
            <div className="text-sm text-primary mb-1 font-normal">Total Sales</div>
            <div className="text-xl sm:text-2xl font-normal text-gray-900">
              {loading ? "…" : formatCurrency(totals.sales)}
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-sm text-green-600 mb-1 font-normal">Total Receipts</div>
            <div className="text-xl sm:text-2xl font-normal text-gray-900">
              {loading ? "…" : formatCurrency(totals.receipts)}
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-sm text-red-600 mb-1 font-normal">Total Expenses</div>
            <div className="text-xl sm:text-2xl font-normal text-gray-900">
              {loading ? "…" : formatCurrency(totals.expenses)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
