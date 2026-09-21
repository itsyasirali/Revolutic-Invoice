"use client";

import React from "react";
import { OrgLink as Link } from "@/components/organization/OrgLink";
import {
  Home,
  ChevronRight,
  Mail,
  Phone,
  FileText,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  DollarSign,
  Eye,
  Send,
} from "lucide-react";
import { Table, StatusBadge, Button } from "@/components/ui";
import useInvoiceDetails from "@/hooks/invoices/useInvoiceDetails";
import type { Invoice } from "@/types/invoice";
import usePlaceholderResolver from "@/hooks/common/usePlaceholderResolver";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import type { TableColumn } from "@/types/common";

const InvoiceDetails: React.FC = () => {
  const {
    mounted,
    invoice,
    handleSend,
    handlePreviewPdf,
    invoiceNumberDisplay,
    currency,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    issueDateFormatted,
    dueDateFormatted,
    subtotal,
    discountPercent,
    discountAmount,
    total,
    amountPaid,
    balanceDue,
    statusText,
    statusVariant,
  } = useInvoiceDetails();
  const { resolve } = usePlaceholderResolver("invoice", invoice);

  const columns: TableColumn<Invoice["items"][0]>[] = [
    {
      key: "item",
      label: "ITEM DETAILS",
      render: (item) => (
        <div className="space-y-0.5">
          <p className="font-bold text-slate-900 text-sm">
            {item.title || item.name || "Unnamed Item"}
          </p>
          {item.description && (
            <p className="text-xs text-slate-500 line-clamp-2">
              {resolve(item.description)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "quantity",
      label: "QTY",
      align: "center" as const,
      render: (item) => (
        <span className="font-semibold text-slate-700">
          {item.quantity}{" "}
          {item.unit ? (
            <span className="text-slate-400 text-xs font-normal">
              {item.unit}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: "rate",
      label: "RATE",
      align: "right" as const,
      render: (item) => (
        <span className="font-semibold text-slate-700">
          {currency}{" "}
          {(Number(item.rate) || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: "amount",
      label: "AMOUNT",
      align: "right" as const,
      render: (item) => (
        <span className="font-bold text-slate-900">
          {currency}{" "}
          {(Number(item.amount) || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
  ];

  if (!mounted || !invoice) {
    return null;
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 py-2">
      {/* 1. Breadcrumb */}
      <nav
        className="flex items-center gap-2 text-sm text-slate-500"
        aria-label="Breadcrumb"
      >
        <Link
          href="/dashboard"
          className="text-primary hover:text-primary/80 transition-colors flex items-center"
          title="Dashboard"
        >
          <Home className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link
          href="/invoices"
          className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
        >
          Invoices
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
          {invoiceNumberDisplay}
        </span>
      </nav>

      {/* 2. Invoice Header Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar + Title + Status + Invoice ID */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0 shadow-xs">
            <FileText className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {invoiceNumberDisplay}
              </h1>
              <StatusBadge status={statusText} variant={statusVariant} />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Invoice ID: {invoiceNumberDisplay}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center flex-col flex-wrap gap-3 shrink-0">
          <Button
            onClick={handleSend}
            variant="primary"
            size="md"
            className="font-medium rounded-lg shadow-xs"
            icon={<Send className="w-4 h-4" />}
          >
            Send Invoice
          </Button>
          <Button
            onClick={handlePreviewPdf}
            variant="outline"
            size="md"
            className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg shadow-2xs"
            icon={<Eye className="w-4 h-4" />}
          >
            Preview PDF
          </Button>
        </div>
      </div>

      {/* 3. Overview Card (Invoice Information + Financial Summary) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Invoice Information (Left Side) */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Invoice Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
              {/* Billed To */}
              <div>
                <h3 className="text-xs font-semibold text-slate-800 mb-3">
                  Billed To
                </h3>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <p className="font-semibold text-slate-900 truncate">
                    {customerName}
                  </p>
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate" title={customerEmail}>
                      {customerEmail}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{customerPhone}</span>
                  </div>
                  <div className="flex items-start gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate">{customerAddress}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Dates */}
              <div>
                <h3 className="text-xs font-semibold text-slate-800 mb-3">
                  Invoice Dates
                </h3>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Issue: {issueDateFormatted}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Due: {dueDateFormatted}</span>
                  </div>
                  {invoice.terms && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{invoice.terms}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="text-xs font-semibold text-slate-800 mb-3">
                  Payment Details
                </h3>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Currency: {currency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Status: {statusText}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary (Right Side) */}
          <div className="lg:col-span-6 lg:border-l lg:border-slate-100 lg:pl-8 space-y-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Financial Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Received */}
              <div className="bg-[#f0fdf4] border border-emerald-100/90 rounded-md p-4 flex flex-col justify-between min-h-[130px]">
                <div className="text-emerald-600">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-500">Received</p>
                  <p className="text-base sm:text-lg font-bold text-emerald-700 mt-1 truncate">
                    {currency}{" "}
                    {Number(amountPaid).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {/* Remaining / Balance Due */}
              <div className="bg-[#fffbeb] border border-amber-100/90 rounded-md p-4 flex flex-col justify-between min-h-[110px]">
                <div className="text-amber-600">
                  <Clock className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-500">
                    Balance Due
                  </p>
                  <p className="text-base sm:text-lg font-bold text-amber-600 mt-1 truncate">
                    {currency}{" "}
                    {Number(balanceDue).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Line Items Table & Financial Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight mb-4">
            Line Items
          </h2>
          <Table
            columns={columns}
            data={invoice.items || []}
            showCheckbox={false}
            variant="default"
            emptyMessage="No items found in this invoice"
            emptyIcon={FileText}
          />
        </div>

        {/* Totals Breakdown */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <div className="w-full max-w-sm space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold text-slate-900">
                {currency}{" "}
                {subtotal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">
                  Discount {discountPercent ? `(${discountPercent}%)` : ""}
                </span>
                <span className="font-semibold text-rose-600">
                  - {currency}{" "}
                  {discountAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            <div className="flex justify-between text-slate-900 font-bold pt-3 border-t border-slate-200 text-base">
              <span>Total</span>
              <span className="text-primary text-lg font-black">
                {currency}{" "}
                {total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between text-slate-600 font-medium">
              <span>Received</span>
              <span className="text-emerald-700 font-bold">
                {currency}{" "}
                {amountPaid.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between font-bold pt-2 border-t border-slate-200 text-base">
              <span className="text-slate-900">Balance Due</span>
              <span
                className={
                  balanceDue <= 0 ? "text-emerald-600" : "text-amber-600"
                }
              >
                {currency}{" "}
                {balanceDue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Notes & Terms
            </h3>
            <div
              className="p-4 bg-slate-50/80 rounded-lg border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(resolve(invoice.notes, true)),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetails;
