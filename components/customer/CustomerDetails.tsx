"use client";

import React from "react";
import {
  Mail,
  Phone,
  FileText,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Paperclip,
  Download,
} from "lucide-react";
import {
  Table,
  StatusBadge,
  Tabs,
  CurrencyDisplay,
  ConfirmDialog,
} from "@/components/ui";
import type { UIInvoiceListItem, PaymentTransaction } from "@/types/customer";
import type { TableColumn } from "@/types/common";
import CustomerRelatedTable, { type RelatedTab } from "./CustomerRelatedTable";
import useCustomerDetailsView, {
  type CustomerTab,
} from "@/hooks/customers/useCustomerDetailsView";
import CustomerPortalCard from "@/components/portal/CustomerPortalCard";
import DetailHeader from "@/components/ui/DetailHeader";

const CustomerDetails: React.FC = () => {
  const {
    customer,
    loading,
    financials,
    customerInvoices,
    customerTransactions,
    related,
    activeTab,
    setActiveTab,
    mounted,
    customerIdDisplay,
    customerSince,
    billingAddressLines,
    customerLocation,
    email,
    phone,
    contactList,
    documentList,
    currency,

    tabs,
    handleBackClick,
    handleDelete,
    confirmDialog,
    confirmDelete,
    hideConfirmDialog,
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

  const contactColumns: TableColumn<(typeof contactList)[number]>[] = [
    {
      key: "name",
      label: "NAME",
      width: "30%",
      render: (item) => (
        <span className="font-bold text-gray-900" title={item.name}>
          {item.name}
        </span>
      ),
    },
    {
      key: "email",
      label: "EMAIL",
      width: "40%",
      render: (item) => <span className="text-gray-600 break-all" title={item.email}>
          {item.email}
        </span>,
    },
    {
      key: "phone",
      label: "PHONE",
      width: "30%",
      render: (item) => <span className="text-gray-600" title={item.phone}>
          {item.phone}
        </span>,
    },
  ];

  const documentColumns: TableColumn<(typeof documentList)[number]>[] = [
    {
      key: "name",
      label: "DOCUMENT NAME",
      width: "80%",
      render: (item) => (
        <span className="flex items-center gap-2 font-bold text-gray-900 min-w-0">
          <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate" title={item.name}>
            {item.name}
          </span>
        </span>
      ),
    },
    {
      key: "action",
      label: "",
      width: "20%",
      align: "right" as const,
      render: (item) => (
        <a
          href={item.url}
          download={item.name}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium text-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </a>
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
      <ConfirmDialog
        isOpen={confirmDialog.show}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={hideConfirmDialog}
      />

      <DetailHeader
        title={customer.displayName || "Customer"}
        subtitle={<>Customer ID: {customerIdDisplay}</>}
        onEdit={handleEdit}
        editTitle="Edit customer"
        onClose={handleBackClick}
        menu={[
          { label: "New Invoice", onClick: handleNewInvoice },
          { label: "Delete", onClick: handleDelete, danger: true },
        ]}
      />

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as CustomerTab)}
        />
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Overview Card (Customer Information + Financial Summary) */}
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
                    <span className="truncate" title={phone}>
                      {phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate" title={customerLocation}>
                      {customerLocation}
                    </span>
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
                      <p key={idx} className="truncate sm:whitespace-normal" title={line}>
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

      <CustomerPortalCard
        customerId={Number(customer.id)}
        contactEmails={(customer.contacts || []).map((c) => c.email || "")}
      />


          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Contacts ({contactList.length})
            </h2>
            <Table
              columns={contactColumns}
              data={contactList}
              selectedIds={[]}
              onSelectAll={() => {}}
              onSelectRow={() => {}}
              getRowId={(item) => item.id}
              emptyMessage="No contacts found"
              emptyIcon={Users}
              showCheckbox={false}
              variant="spacious"
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Documents ({documentList.length})
            </h2>
            <Table
              columns={documentColumns}
              data={documentList}
              selectedIds={[]}
              onSelectAll={() => {}}
              onSelectRow={() => {}}
              getRowId={(item) => item.id}
              emptyMessage="No documents found"
              emptyIcon={Paperclip}
              showCheckbox={false}
              variant="spacious"
            />
          </section>
        </div>
      )}

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
              variant="spacious"
            />
          )}

          {(activeTab === "quotes" ||
            activeTab === "expenses" ||
            activeTab === "timeTracking") && (
            <CustomerRelatedTable tab={activeTab as RelatedTab} related={related} />
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
              variant="spacious"
            />
          )}
      </div>
    </div>
  );
};

export default CustomerDetails;
