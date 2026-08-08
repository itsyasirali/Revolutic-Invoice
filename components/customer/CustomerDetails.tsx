"use client";

import React from "react";
import {
  Mail,
  Phone,
  Edit,
  Trash2,
  FileText,
  MapPin,
  MessageSquare,
  User,
  DollarSign,
  Clock,
  CreditCard,
} from "lucide-react";
import {
  Table,
  StatusBadge,
  Tabs,
  EmptyState,
  CurrencyDisplay,
  Button,
  Card,
  PageHeader,
} from "@/components/ui";
import type { UIInvoiceListItem, PaymentTransaction } from "@/types/customer";
import type { TableColumn } from "@/types/common";
import useCustomerDetailsView, {
  type CustomerTab,
} from "@/hooks/customers/useCustomerDetailsView";

const CustomerDetails: React.FC = () => {
  const {
    customer,
    primaryContact,
    loading,
    financials,
    customerInvoices,
    customerTransactions,
    activeTab,
    setActiveTab,
    handleBackClick,
    handleInvoiceClick,
    handleTransactionClick,
  } = useCustomerDetailsView();

  const invoiceColumns: TableColumn<UIInvoiceListItem>[] = [
    {
      key: "invoice",
      label: "INVOICE NUMBER",
      sortable: true,
      render: (item) => (
        <span className="font-bold text-gray-900">{item.invoice}</span>
      ),
    },
    {
      key: "date",
      label: "DATE",
      sortable: true,
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
          }
        />
      ),
    },
  ];

  const transactionColumns: TableColumn<PaymentTransaction>[] = [
    {
      key: "paymentDate",
      label: "DATE",
      sortable: true,
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
      sortable: true,
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

  if (loading && !customer) {
    return (
      null
    );
  }

  if (!customer) {
    return (
      null
    );
  }

  const tabs = [
    { label: "Overview", value: "overview" },
    { label: "Invoices", value: "invoices", count: customerInvoices.length },
    {
      label: "Transactions",
      value: "transactions",
      count: customerTransactions.length,
    },
  ];

  return (
    <div className="">
      <PageHeader
        title={customer.displayName || ""}
        showBackButton
        onBack={handleBackClick}
      />

      <div className="space-y-6">
        {/* Quick Stats Integrated */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md flex items-center justify-center bg-green-600 text-white transition-colors duration-300">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-gray-900 font-bold text-lg leading-tight">
                    Received
                  </h5>
                  <span className="text-xs font-medium text-gray-500">
                    Total Amount
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md bg-green-50/50 border border-green-100/50">
                <span className="text-sm font-medium text-gray-600">
                  Amount
                </span>
                <CurrencyDisplay
                  amount={financials.received}
                  currency={customer.currency}
                  className="text-[15px] font-bold text-green-700"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md flex items-center justify-center bg-orange-600 text-white transition-colors duration-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-gray-900 font-bold text-lg leading-tight">
                    Pending
                  </h5>
                  <span className="text-xs font-medium text-gray-500">
                    Total Remaining
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md bg-orange-50/50 border border-orange-100/50">
                <span className="text-sm font-medium text-gray-600">
                  Amount
                </span>
                <CurrencyDisplay
                  amount={financials.remaining}
                  currency={customer.currency}
                  className="text-[15px] font-bold text-orange-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="flex flex-col mt-4">
          <div className="mb-4">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(value) => setActiveTab(value as CustomerTab)}
            />
          </div>

          <div>
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-medium text-gray-800 mb-4">
                      General Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50/50 rounded-md border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Customer Type
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {customer.customerType || "Individual"}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50/50 rounded-md border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Currency
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {customer.currency || "USD"}
                        </p>
                      </div>
                      <div className="md:col-span-2 p-4 bg-gray-50/50 rounded-md border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> Address
                        </p>
                        <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                          {customer.address || "No address provided"}
                        </p>
                      </div>
                      {customer.remarks && (
                        <div className="md:col-span-2 p-4 bg-gray-50/50 rounded-md border border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" /> Remarks
                          </p>
                          <p className="text-sm text-gray-600 italic">
                            &quot;{customer.remarks}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar - Contact Info */}
                <div className="space-y-6">
                  <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-medium text-gray-800 mb-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" /> Primary Contact
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-md border border-blue-100/50">
                        <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center shadow-sm">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">
                            Full Name
                          </p>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {primaryContact.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-100">
                        <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center shadow-sm">
                          <Mail className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">
                            Email Address
                          </p>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {primaryContact.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-100">
                        <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center shadow-sm">
                          <Phone className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">
                            Mobile Number
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {primaryContact.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "invoices" && (
              <div className="">
                {customerInvoices.length > 0 ? (
                  <Table
                    columns={invoiceColumns}
                    data={customerInvoices}
                    selectedIds={[]}
                    onSelectAll={() => {}}
                    onSelectRow={() => {}}
                    getRowId={(item) => item.id}
                    onRowClick={(item) => handleInvoiceClick(item.id)}
                    emptyMessage="No invoices found"
                    showCheckbox={false}
                  />
                ) : (
                  <div className="py-20">
                    <EmptyState
                      icon={FileText}
                      title="No Invoices"
                      message="This customer doesn't have any invoices yet."
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="">
                {customerTransactions.length > 0 ? (
                  <Table
                    columns={transactionColumns}
                    data={customerTransactions}
                    selectedIds={[]}
                    onSelectAll={() => {}}
                    onSelectRow={() => {}}
                    getRowId={(item) => item.id || item.id}
                    onRowClick={(item) =>
                      handleTransactionClick(item.id || item.id)
                    }
                    emptyMessage="No transactions found"
                    showCheckbox={false}
                  />
                ) : (
                  <div className="py-20">
                    <EmptyState
                      icon={DollarSign}
                      title="No Transactions"
                      message="No payment transactions found for this customer."
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
