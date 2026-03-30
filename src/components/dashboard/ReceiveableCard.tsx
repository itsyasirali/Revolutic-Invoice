import React from "react";
import { Plus } from "lucide-react";
import { useReceivables } from "../../hooks/invoices/useReceivables";
import type { BucketKey } from "../../hooks/invoices/useReceivables";

const formatPKR = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
  }).format(value);

const uiBuckets = [
  {
    key: "current" as BucketKey,
    label: "CURRENT",
    period: "",
    color: "text-primary",
  },
  {
    key: "1-15" as BucketKey,
    label: "RECEIVED",
    period: "",
    color: "text-green-600",
  },
  {
    key: "overdue-total",
    label: "OVERDUE",
    period: "1–15 Days",
    color: "text-red-600",
  },
  {
    key: "16-30" as BucketKey,
    label: "",
    period: "16–30 Days",
    color: "text-gray-700",
  },
  {
    key: "31-45" as BucketKey,
    label: "",
    period: "30-45 Days",
    color: "text-gray-700",
  },
] as const;

export const ReceivablesCard: React.FC = () => {
  const { buckets, totalReceivables, isLoading } = useReceivables();

  const overdueTotal =
    buckets["16-30"] + buckets["31-45"];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow w-[97%] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-gray-100">
        <h2 className="text-base sm:text-lg font-normal text-gray-700">
          Total Receivables
        </h2>

        <button className="flex items-center space-x-2 text-primary hover:text-primary/80 text-sm font-medium px-2 py-1 hover:bg-primary/5 rounded">
          <span className="bg-primary w-4 h-4 flex justify-center items-center text-white rounded-full">
            <Plus size={12} />
          </span>
          <span>New</span>
        </button>
      </div>

      {/* Total */}
      <div className="p-3">
        <p className="text-sm text-gray-600 mb-2">
          Total Receivables{" "}
          <span className="font-semibold">
            {isLoading ? "Calculating…" : formatPKR(totalReceivables)}
          </span>
        </p>
        <div className="w-full h-2 bg-primary/40 rounded-full" />
      </div>

      {/* Buckets */}
      <div className="grid xs:grid-cols-2 sm:grid-cols-5 gap-4 px-3 pb-4">
        {uiBuckets.map((bucket) => {
          const value =
            bucket.key === "overdue-total"
              ? overdueTotal
              : buckets[bucket.key];

          return (
            <div key={bucket.key} className="flex flex-col items-start">
              <p className={`text-xs font-semibold mb-1 ${bucket.color}`}>
                {bucket.label}
              </p>

              <p className="text-lg font-semibold text-gray-700 truncate">
                {isLoading ? "…" : formatPKR(value)}
              </p>

              <p className="text-xs text-gray-500">{bucket.period}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
