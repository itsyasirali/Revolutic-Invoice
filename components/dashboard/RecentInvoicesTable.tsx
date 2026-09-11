"use client";

import React from "react";
import Link from "next/link";
import { FileText, ArrowRight, MoreHorizontal, Plus } from "lucide-react";
import type { DashboardInvoice } from "@/types/dashboard";

interface RecentInvoicesTableProps {
  invoices: DashboardInvoice[];
}

const RecentInvoicesTable = ({ invoices }: RecentInvoicesTableProps) => {
  const getStatusBadge = (status: DashboardInvoice["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 text-emerald-600 border-emerald-100/80";
      case "Partial":
        return "bg-sky-50 text-sky-600 border-sky-100/80";
      case "Unpaid":
        return "bg-amber-50 text-amber-600 border-amber-100/80";
      case "Overdue":
        return "bg-rose-50 text-rose-600 border-rose-100/80";
      case "Draft":
      default:
        return "bg-slate-100 text-slate-600 border-slate-200/60";
    }
  };

  return (
    <div className="bg-white rounded-md p-5 border border-slate-200/80 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-md bg-blue-50 text-[#1E6BFF] flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </span>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Invoices
          </h2>
        </div>

        <Link
          href="/invoices"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E6BFF] hover:text-blue-700 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table or Empty State */}
      {invoices.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            No invoices yet
          </p>
          <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
            Create your first invoice to begin tracking your billing and
            revenue.
          </p>
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2 font-medium w-10">#</th>
                <th className="pb-3 font-medium">INVOICE</th>
                <th className="pb-3 font-medium">CUSTOMER</th>
                <th className="pb-3 font-medium">DATE</th>
                <th className="pb-3 font-medium">STATUS</th>
                <th className="pb-3 font-medium text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv) => (
                <tr
                  key={`${inv.id}-${inv.indexNumber}`}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  <td className="py-3 pl-2 text-slate-400 font-medium">
                    {inv.indexNumber}
                  </td>
                  <td className="py-3 font-semibold text-slate-800">
                    <Link
                      href={`/invoices`}
                      className="hover:text-[#1E6BFF] transition-colors"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="py-3 text-slate-600 font-medium">
                    {inv.customerName}
                  </td>
                  <td className="py-3 text-slate-400">{inv.date}</td>
                  <td className="py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${getStatusBadge(
                        inv.status,
                      )}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900">
                    Rs {inv.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentInvoicesTable;
