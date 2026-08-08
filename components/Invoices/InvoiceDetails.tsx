"use client";

import React from "react";
import { Edit, Download, Send, FileText, Eye } from "lucide-react";
import {
  Button,
  EmptyState,
  PageHeader,
  StatusBadge,
  Table,
} from "@/components/ui";
import useInvoicePreview from "@/hooks/invoices/useInvoicePreview";
import { useRouter } from "next/navigation";
import type { Invoice } from "@/types/invoice";
import type { TableColumn } from "@/types/common";

const InvoiceDetails: React.FC = () => {
  const { invoice, handleEdit, handleSend, handleBackClick } =
    useInvoicePreview();
  const router = useRouter();

  if (!invoice) {
    return (
      null
    );
  }

  const handlePreviewPdf = () => {
    router.push(`/invoices/preview/${invoice.id || invoice._id}`);
  };

  const calculateSubtotal = () => {
    return (invoice.items || []).reduce(
      (acc: number, item: Invoice["items"][0]) =>
        acc + (Number(item.amount) || 0),
      0,
    );
  };

  const calculateTax = () => {
    // Currently relying on existing total minus subtotal or invoice.taxAmount if it exists
    const sub = calculateSubtotal();
    return (invoice.total || 0) - sub;
  };

  const amountPaid = invoice.amountReceived || 0; // Or calculate from payments
  const balanceDue = (invoice.total || 0) - amountPaid;

  const columns: TableColumn<Invoice["items"][0]>[] = [
    {
      key: "name",
      label: "Item",
      align: "left",
      render: (item) => (
        <span className="font-medium text-gray-900">
          {item.title || item.name}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      align: "left",
      render: (item) => (
        <span className="text-gray-500">{item.description}</span>
      ),
    },
    {
      key: "quantity",
      label: "Qty",
      align: "right",
      render: (item) => <span className="text-gray-900">{item.quantity}</span>,
    },
    {
      key: "rate",
      label: "Price",
      align: "right",
      render: (item) => (
        <span className="text-gray-900">
          {(Number(item.rate) || 0).toLocaleString("en-US", {
            style: "currency",
            currency: invoice.currency || "USD",
          })}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Total",
      align: "right",
      render: (item) => (
        <span className="font-medium text-gray-900">
          {(Number(item.amount) || 0).toLocaleString("en-US", {
            style: "currency",
            currency: invoice.currency || "USD",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="pb-8">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-gray-900">
              Invoice {invoice.invoiceNumber || invoice.invoice}
            </span>
          </div>
        }
        showBackButton={true}
        onBack={handleBackClick}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={handleEdit}
              variant="secondary"
              size="md"
              icon={<Edit className="w-4 h-4" />}
            >
              Edit
            </Button>
            <Button
              onClick={handlePreviewPdf}
              variant="secondary"
              size="md"
              icon={<Eye className="w-4 h-4" />}
            >
              Preview PDF
            </Button>
            <Button
              onClick={handleSend}
              variant="primary"
              size="md"
              icon={<Send className="w-4 h-4" />}
            >
              Send Invoice
            </Button>
          </div>
        }
      />

      <div className="px-6 mt-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Bill To
            </h2>
            <div className="text-gray-900">
              <p className="font-bold text-lg mb-1">
                {invoice.customerDisplayName || invoice.customer?.displayName}
              </p>
              <p className="text-gray-600 mb-1">
                {invoice.customerEmail || invoice.customer?.email}
              </p>
              {invoice.customer?.phone && (
                <p className="text-gray-600 mb-1">{invoice.customer.phone}</p>
              )}
              {invoice.customer?.address && (
                <p className="text-gray-600 whitespace-pre-wrap">
                  {invoice.customer.address}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-12">
            <div className="text-right">
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 mb-1">
                  Issue Date
                </h2>
                <p className="text-gray-900 font-medium">
                  {invoice.invoiceDate
                    ? new Date(invoice.invoiceDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 mb-1">
                  Due Date
                </h2>
                <p className="text-gray-900 font-medium">
                  {invoice.dueDate
                    ? new Date(invoice.dueDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <Table
            columns={columns}
            data={invoice.items || []}
            showCheckbox={false}
            variant="default"
            className="!rounded-lg"
          />
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-12">
          <div className="w-72 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">
                {calculateSubtotal().toLocaleString("en-US", {
                  style: "currency",
                  currency: invoice.currency || "USD",
                })}
              </span>
            </div>
            {calculateTax() > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span className="font-medium text-gray-900">
                  {calculateTax().toLocaleString("en-US", {
                    style: "currency",
                    currency: invoice.currency || "USD",
                  })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-gray-900 font-bold pt-3 border-t border-gray-200 text-base">
              <span>Total</span>
              <span>
                {(invoice.total || 0).toLocaleString("en-US", {
                  style: "currency",
                  currency: invoice.currency || "USD",
                })}
              </span>
            </div>
            <div className="flex justify-between font-bold pt-3 border-t border-gray-200 text-base">
              <span className="text-gray-900">Balance Due</span>
              <span
                className={
                  balanceDue <= 0 ? "text-green-600" : "text-orange-600"
                }
              >
                {balanceDue.toLocaleString("en-US", {
                  style: "currency",
                  currency: invoice.currency || "USD",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Notes</h2>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetails;
