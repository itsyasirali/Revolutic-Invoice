"use client";

import React from "react";
import useDocumentTitle from "@/hooks/common/useDocumentTitle";
import {
  FileText,
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
import { DetailRow, DetailSection } from "@/components/ui/DetailParts";
import { formatDate } from "@/lib/format";
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
  useDocumentTitle(customer ? `${customer.displayName || customer.companyName || "Customer"} | Customer Details` : undefined);

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
        <div>
          <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
            <DetailRow label="Customer Type">{customer.customerType || "Business"}</DetailRow>
            <DetailRow label="Company Name">{customer.companyName}</DetailRow>
            <DetailRow label="Email">{email}</DetailRow>
            <DetailRow label="Phone">{phone}</DetailRow>
            <DetailRow label="Currency">{currency}</DetailRow>
            <DetailRow label="Status">{customer.status === "inActive" ? "Inactive" : "Active"}</DetailRow>
            <DetailRow label="Customer Since">{formatDate(customer.createdAt) || customerSince}</DetailRow>
            <DetailRow label="Created Source">User</DetailRow>
            {customer.remarks && (
              <div className="lg:col-span-2">
                <DetailRow label="Remarks">{customer.remarks}</DetailRow>
              </div>
            )}
          </div>

          <DetailSection title="Billing Address">
            <div className="py-1 text-sm text-slate-900 leading-relaxed">
              {billingAddressLines.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Financial Summary">
            <DetailRow label="Received">
              {currency} {Number(financials.received || 0).toLocaleString("en-US")}
            </DetailRow>
            <DetailRow label="Remaining">
              {currency} {Number(financials.remaining || 0).toLocaleString("en-US")}
            </DetailRow>
          </DetailSection>

          <section className="mt-8">
            <h3 className="mb-2 text-base font-medium text-slate-900">Contacts ({contactList.length})</h3>
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

          <section className="mt-8">
            <h3 className="mb-2 text-base font-medium text-slate-900">Documents ({documentList.length})</h3>
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

          <div className="mt-8">
            <CustomerPortalCard
              customerId={Number(customer.id)}
              contactEmails={(customer.contacts || []).map((c) => c.email || "")}
            />
          </div>

          <DetailSection title="Reporting Tags">
            <p className="text-sm text-primary/80">No reporting tag has been associated with this customer.</p>
          </DetailSection>
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
