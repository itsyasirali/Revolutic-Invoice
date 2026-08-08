"use client";

import React, { useMemo } from "react";
import { FileText, MoreHorizontal } from "lucide-react";
import { Table } from "@/components/ui";

export type RecentInvoice = {
  id: string | number;
  invoiceNumber: string;
  customerName: string;
  total: number;
  currency: string;
  status: string;
  invoiceDate: string | Date;
  createdAt: string | Date;
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-700";
    case "sent":
      return "bg-primary/10 text-primary";
    case "overdue":
      return "bg-red-100 text-red-700";
    case "partially paid":
      return "bg-yellow-100 text-yellow-700";
    case "draft":
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const RecentInvoices = ({ invoices }: { invoices: RecentInvoice[] }) => {
  const columns = useMemo(
    () => [
      {
        key: "invoice",
        label: "Invoice",
        render: (inv: RecentInvoice) => (
          <div className="flex items-center gap-3">
            <div>
              <span className="font-medium text-gray-900 block">
                {inv.invoiceNumber}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "client",
        label: "Client",
        render: (inv: RecentInvoice) => (
          <span className="text-sm font-medium text-gray-700">
            {inv.customerName || "Unknown Client"}
          </span>
        ),
      },
      {
        key: "date",
        label: "Date",
        render: (inv: RecentInvoice) => (
          <span className="text-sm text-gray-600">
            {new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "2-digit",
                year: "numeric",
              },
            )}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (inv: RecentInvoice) => (
          <span
            className={`px-2.5 py-1 rounded-sm text-xs font-medium capitalize whitespace-nowrap ${getStatusColor(inv.status)}`}
          >
            {inv.status || "Draft"}
          </span>
        ),
      },
      {
        key: "amount",
        label: "Amount",
        align: "right" as const,
        render: (inv: RecentInvoice) => (
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-900">
              {inv.total.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {inv.currency}
            </span>
          </div>
        ),
      },
    ],
    [],
  );

  if (!invoices || invoices.length === 0) return null;

  return (
    <div className="mt-6 overflow-hidden">
      <div className="py-4 flex justify-between">
        <div>
          <h2 className="text-[17px] font-medium text-gray-800">
            Recent Invoices
          </h2>
        </div>
        <button className="text-sm font-medium text-primary hover:text-primary transition-colors">
          View All
        </button>
      </div>

      <div className="w-full">
        <Table<RecentInvoice>
          columns={columns}
          data={invoices}
          getRowId={(i) => String(i.id)}
          emptyMessage="No recent invoices"
          variant="default"
          showCheckbox={false}
        />
      </div>
    </div>
  );
};

export default RecentInvoices;
