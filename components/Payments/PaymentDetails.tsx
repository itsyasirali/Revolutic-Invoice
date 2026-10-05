"use client";
import DetailHeader from "@/components/ui/DetailHeader";
import useDocumentTitle from "@/hooks/common/useDocumentTitle";

import React from "react";
import { Table, Tabs } from "@/components/ui";
import { ActivityList, DetailRow, DetailSection } from "@/components/ui/DetailParts";
import usePaymentPreview from "@/hooks/payments/usePaymentPreview";
import { useRouter } from "next/navigation";
import type { TableColumn } from "@/types/common";
import type { AppliedInvoice } from "@/types/payment";

const PaymentDetails: React.FC = () => {
  const { payment, handleEdit, handleSendClick, handleBackClick } =
    usePaymentPreview();
  const router = useRouter();
  const [tab, setTab] = React.useState<"overview" | "activity">("overview");
  useDocumentTitle(payment ? `Payment ${payment.paymentNumber ?? ""} | Payment Details`.replace("  ", " ") : undefined);

  if (!payment) {
    return (
      null
    );
  }

  const handlePreviewPdf = () => {
    router.push(`/payments/preview/${payment.id}`);
  };

  const columns: TableColumn<
    AppliedInvoice & { totalAmount?: number }
  >[] = [
    {
      key: "invoiceNumber",
      label: "Invoice Number",
      align: "left",
      render: (applied) => (
        <span className="font-medium text-gray-900">
          {applied.invoiceNumber || applied.invoice?.invoiceNumber || applied.invoiceId || "N/A"}
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

  const currency = payment.currency || "USD";
  const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency });
  const bankCharges = Number(payment.bankCharges || 0);

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 py-2">
      <DetailHeader
        title={`Payment ${payment.paymentNumber || ""}`.trim()}
        subtitle={payment.status ? <>{payment.status}</> : undefined}
        onEdit={() => handleEdit(payment.id || "")}
        editTitle="Edit payment"
        onClose={handleBackClick}
        menu={[
          { label: "Preview PDF", onClick: handlePreviewPdf },
          { label: "Send Receipt", onClick: handleSendClick },
        ]}
      />

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <Tabs
          tabs={[
            { label: "Overview", value: "overview" },
            { label: "Activity", value: "activity" },
          ]}
          activeTab={tab}
          onTabChange={(v) => setTab(v as "overview" | "activity")}
        />
      </div>

      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
            <DetailRow label="Payment #">{payment.paymentNumber}</DetailRow>
            <DetailRow label="Status">{payment.status}</DetailRow>
            <DetailRow label="Received From">
              {payment.customerDisplayName || payment.customer?.displayName}
            </DetailRow>
            <DetailRow label="Email">{payment.customerEmail || payment.customer?.email}</DetailRow>
            <DetailRow label="Phone">{payment.customer?.phone}</DetailRow>
            <DetailRow label="Payment Date">
              {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : ""}
            </DetailRow>
            <DetailRow label="Payment Mode">{payment.paymentMode}</DetailRow>
            <DetailRow label="Reference Number">{payment.referenceNo}</DetailRow>
            <DetailRow label="Currency">{currency}</DetailRow>
            <DetailRow label="Amount Received">{money(payment.amountReceived || 0)}</DetailRow>
          </div>

          {payment.appliedInvoices && payment.appliedInvoices.length > 0 && (
            <DetailSection title="Applied Invoices">
              <Table
                columns={columns}
                data={payment.appliedInvoices}
                showCheckbox={false}
                variant="default"
                className="!rounded-lg"
                getRowId={(item) => item.invoiceId || item.invoiceNumber || Math.random().toString()}
              />
            </DetailSection>
          )}

          <DetailSection title="Summary">
            <div className="flex justify-end">
              <dl className="w-full sm:w-80 text-sm space-y-2">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Amount Received</dt>
                  <dd>{money(payment.amountReceived || 0)}</dd>
                </div>
                {bankCharges > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Bank Charges</dt>
                    <dd>- {money(bankCharges)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-base font-bold text-slate-900">
                  <dt>Total Credit</dt>
                  <dd>{money((payment.amountReceived || 0) - bankCharges)}</dd>
                </div>
              </dl>
            </div>
          </DetailSection>

          {payment.notes && (
            <DetailSection title="Notes">
              <p className="text-sm text-slate-900 whitespace-pre-wrap">{payment.notes}</p>
            </DetailSection>
          )}
        </div>
      )}

      {tab === "activity" && (
        <div>
          <h3 className="mb-4 text-base font-medium text-slate-900">Activity</h3>
          <ActivityList
            entries={[
              { label: "Payment recorded", at: payment.createdAt as string | undefined },
              { label: payment.status ? `Status: ${payment.status}` : "Last updated", at: payment.updatedAt as string | undefined },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;
