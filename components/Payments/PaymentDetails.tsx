"use client";

import React from "react";
import { Edit, Send, FileText, Eye } from "lucide-react";
import {
  Button,
  EmptyState,
  PageHeader,
  StatusBadge,
  Table,
} from "@/components/ui";
import usePaymentPreview from "@/hooks/payments/usePaymentPreview";
import { useRouter } from "next/navigation";
import type { TableColumn } from "@/types/common";
import type { AppliedInvoice } from "@/types/payment";

const PaymentDetails: React.FC = () => {
  const { payment, handleEdit, handleSendClick, handleBackClick } =
    usePaymentPreview();
  const router = useRouter();

  if (!payment) {
    return (
      null
    );
  }

  const handlePreviewPdf = () => {
    router.push(`/payments/preview/${payment.id}`);
  };

  const columns: TableColumn<
    AppliedInvoice & { invoice?: { total: number }; totalAmount?: number }
  >[] = [
    {
      key: "invoiceNumber",
      label: "Invoice Number",
      align: "left",
      render: (applied) => (
        <span className="font-medium text-gray-900">
          {applied.invoiceNumber || applied.invoiceId || "N/A"}
        </span>
      ),
    },
    {
      key: "invoiceAmount",
      label: "Invoice Amount",
      align: "right",
      render: (applied) => (
        <span className="text-gray-900">
          {Number(
            applied.invoiceAmount ||
              applied.invoice?.total ||
              applied.totalAmount ||
              0,
          ).toLocaleString("en-US", {
            style: "currency",
            currency: payment.currency || "USD",
          })}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount Applied",
      align: "right",
      render: (applied) => (
        <span className="font-medium text-green-600">
          {Number(applied.amount || 0).toLocaleString("en-US", {
            style: "currency",
            currency: payment.currency || "USD",
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
              Payment {payment.paymentNumber || ""}
            </span>
          </div>
        }
        showBackButton={true}
        onBack={handleBackClick}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleEdit(payment.id || "")}
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
              onClick={handleSendClick}
              variant="primary"
              size="md"
              icon={<Send className="w-4 h-4" />}
            >
              Send Receipt
            </Button>
          </div>
        }
      />

      <div className="px-6 mt-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Received From
            </h2>
            <div className="text-gray-900">
              <p className="font-bold text-lg mb-1">
                {payment.customerDisplayName || payment.customer?.displayName}
              </p>
              <p className="text-gray-600 mb-1">
                {payment.customerEmail || payment.customer?.email}
              </p>
              {payment.customer?.phone && (
                <p className="text-gray-600 mb-1">{payment.customer.phone}</p>
              )}
            </div>
          </div>

          <div className="flex gap-12">
            <div className="text-right">
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 mb-1">
                  Payment Date
                </h2>
                <p className="text-gray-900 font-medium">
                  {payment.paymentDate
                    ? new Date(payment.paymentDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-500 mb-1">
                  Reference Number
                </h2>
                <p className="text-gray-900 font-medium">
                  {payment.referenceNo || "N/A"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 mb-1">
                  Payment Mode
                </h2>
                <p className="text-gray-900 font-medium">
                  {payment.paymentMode || "N/A"}
                </p>
              </div>
              <div className="bg-green-50/50 border border-green-100 rounded-lg p-4 min-w-[160px]">
                <h2 className="text-sm font-semibold text-gray-500 mb-1">
                  Amount Received
                </h2>
                <p className="text-xl font-bold text-gray-900">
                  {(payment.amountReceived || 0).toLocaleString("en-US", {
                    style: "currency",
                    currency: payment.currency || "USD",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Applied Invoices Table */}
        {payment.appliedInvoices && payment.appliedInvoices.length > 0 && (
          <div className="mb-8">
            <Table
              columns={columns}
              data={payment.appliedInvoices}
              showCheckbox={false}
              variant="default"
              className="!rounded-lg"
              getRowId={(item) =>
                item.invoiceId || item.invoiceNumber || Math.random().toString()
              }
            />
          </div>
        )}

        {/* Summary */}
        <div className="flex justify-end mb-12">
          <div className="w-72 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Amount Received</span>
              <span className="font-medium text-gray-900">
                {(payment.amountReceived || 0).toLocaleString("en-US", {
                  style: "currency",
                  currency: payment.currency || "USD",
                })}
              </span>
            </div>
            {payment.bankCharges && payment.bankCharges > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Bank Charges</span>
                <span className="font-medium text-red-600">
                  -
                  {payment.bankCharges.toLocaleString("en-US", {
                    style: "currency",
                    currency: payment.currency || "USD",
                  })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-gray-900 font-bold pt-3 border-t border-gray-200 text-base">
              <span>Total Credit</span>
              <span className="text-green-600">
                {(
                  (payment.amountReceived || 0) - (payment.bankCharges || 0)
                ).toLocaleString("en-US", {
                  style: "currency",
                  currency: payment.currency || "USD",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {payment.notes && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Notes</h2>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">
              {payment.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDetails;
