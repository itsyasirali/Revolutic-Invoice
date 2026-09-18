"use client";

import React from "react";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  Mail,
  Phone,
  FileText,
  MapPin,
  Calendar,
  Pencil,
  Plus,
  CheckCircle2,
  Clock,
  DollarSign,
} from "lucide-react";
import {
  Table,
  StatusBadge,
  Tabs,
  CurrencyDisplay,
  Button,
} from "@/components/ui";
import type { UIInvoiceListItem, PaymentTransaction } from "@/types/customer";
import type { TableColumn } from "@/types/common";
import useCustomerDetailsView, {
  type CustomerTab,
} from "@/hooks/customers/useCustomerDetailsView";

const CustomerDetails: React.FC = () => {
  const {
    customer,
    loading,
    financials,
    customerInvoices,
    customerTransactions,
    activeTab,
    setActiveTab,
    mounted,
    customerInitials,
    customerIdDisplay,
    customerSince,
    billingAddressLines,
    customerLocation,
    email,
    phone,
    currency,
    tabs,
    handleBackClick,
    handleEdit,
    handleNewInvoice,
    handleInvoiceClick,
    handleTransactionClick,
  } = useCustomerDetailsView();

  const invoiceColumns: TableColumn<UIInvoiceListItem>[] = [
    {
      key: "invoice",
      label: "INVOICE NUMBER",
      render: (item) => (
        <span className="font-bold text-gray-900">{item.invoice}</span>
      ),
    },
    {
      key: "date",
      label: "DATE",
      render: (item) => <span className="text-gray-600">{item.date}</span>,
    },
    {
      key: "dueDate",
      label: "DUE DATE",
      render: (item) => (
        <span className="text-gray-600">{item.dueDate || ""}</span>
      ),
    },
    {
      key: "amount",
      label: "AMOUNT",
      align: "right" as const,
      render: (item) => (
        <CurrencyDisplay
          amount={Number(item.amount)}
          currency={customer?.currency}
          className="font-bold text-gray-900 text-right"
        />
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (item) => (
        <StatusBadge
          status={item.status.tooltip}
          variant={
            item.status.color as
              | "default"
              | "success"
              | "danger"
              | "warning"
              | "info"
              | "gray"
          }
        />
      ),
    },
  ];

  const transactionColumns: TableColumn<PaymentTransaction>[] = [
    {
      key: "paymentDate",
      label: "DATE",
      render: (item) => {
        const date =
          typeof item.paymentDate === "string"
            ? new Date(item.paymentDate).toLocaleDateString()
            : item.paymentDate instanceof Date
              ? item.paymentDate.toLocaleDateString()
              : "";
        return <span className="text-gray-600">{date}</span>;
      },
    },
    {
      key: "paymentNumber",
      label: "PAYMENT #",
      render: (item) => (
        <span className="font-bold text-gray-900">
          {item.paymentNumber
            ? `PMT-${String(item.paymentNumber).padStart(4, "0")}`
            : ""}
        </span>
      ),
    },
    {
      key: "referenceNo",
      label: "REFERENCE",
      render: (item) => (
        <span className="text-gray-600">{item.referenceNo || ""}</span>
      ),
    },
    {
      key: "paymentMode",
      label: "MODE",
      render: (item) => (
        <StatusBadge status={item.paymentMode} variant="default" />
      ),
    },
    {
      key: "amountReceived",
      label: "AMOUNT",
      render: (item) => (
        <CurrencyDisplay
          amount={item.amountReceived}
          currency={item.currency || customer?.currency}
          className="font-bold text-gray-900"
        />
      ),
    },
  ];

  if (!mounted || (loading && !customer)) {
    return null;
  }

  if (!customer) {
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
          href="/customers"
          className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
        >
          Customers
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
          {customer.displayName || "Customer Details"}
        </span>
      </nav>

      {/* 2. Customer Header Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar + Title + Status + Customer ID */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0 shadow-xs">
            {customerInitials}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {customer.displayName || "Customer"}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Customer ID: {customerIdDisplay}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center flex-col-reverse gap-3 shrink-0">
          <Button
            onClick={handleEdit}
            variant="outline"
            size="md"
            className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg shadow-2xs"
          >
            Edit Customer
          </Button>
          <Button
            onClick={handleNewInvoice}
            variant="primary"
            size="md"
            className="font-medium rounded-lg shadow-xs"
          >
            New Invoice
          </Button>
        </div>
      </div>

      {/* 3. Overview Card (Customer Information + Financial Summary) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Customer Information (Left Side) */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Customer Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
              {/* Contact Details */}
              <div>
                <h3 className="text-xs font-semibold text-slate-800 mb-3">
                  Contact Details
                </h3>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate" title={email}>
                      {email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{phone}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{customerLocation}</span>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div>
                <h3 className="text-xs font-semibold text-slate-800 mb-3">
                  Billing Address
                </h3>
                <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 leading-snug">
                    {billingAddressLines.map((line, idx) => (
                      <p key={idx} className="truncate sm:whitespace-normal">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Customer Since */}
              <div>
                <h3 className="text-xs font-semibold text-slate-800 mb-3">
                  Customer Since
                </h3>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{customerSince}</span>
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
                    {Number(financials.received || 0).toLocaleString("en-US")}
                  </p>
                </div>
              </div>

              {/* Remaining */}
              <div className="bg-[#fffbeb] border border-amber-100/90 rounded-md p-4 flex flex-col justify-between min-h-[110px]">
                <div className="text-amber-600">
                  <Clock className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-500">
                    Remaining
                  </p>
                  <p className="text-base sm:text-lg font-bold text-amber-600 mt-1 truncate">
                    {currency}{" "}
                    {Number(financials.remaining || 0).toLocaleString("en-US")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tabs & Lists */}
      <div className="flex flex-col mt-2">
        <div className="mb-4">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(value) => setActiveTab(value as CustomerTab)}
          />
        </div>

        <div>
          {activeTab === "invoices" && (
            <Table
              columns={invoiceColumns}
              data={customerInvoices}
              selectedIds={[]}
              onSelectAll={() => {}}
              onSelectRow={() => {}}
              getRowId={(item) => item.id}
              onRowClick={(item) => handleInvoiceClick(item.id)}
              emptyMessage="No invoices found"
              emptyIcon={FileText}
              showCheckbox={false}
            />
          )}

          {activeTab === "transactions" && (
            <Table
              columns={transactionColumns}
              data={customerTransactions}
              selectedIds={[]}
              onSelectAll={() => {}}
              onSelectRow={() => {}}
              getRowId={(item) => item.id || item.id}
              onRowClick={(item) => handleTransactionClick(item.id || item.id)}
              emptyMessage="No transactions found"
              emptyIcon={DollarSign}
              showCheckbox={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
