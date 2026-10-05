"use client";

import React, { useState } from "react";
import { paymentEditable } from "@/lib/editLock";
import { Send, Edit, Download, Settings } from "lucide-react";
import { Button, PageHeader, ConfirmDialog, StatusBadge, toast } from "@/components/ui";
import DetailHeader from "@/components/ui/DetailHeader";
import axios from "@/lib/axios";
import { invalidatePayments } from "@/lib/swr";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import PaymentTemplateSelector from "./PaymentTemplateSelector";
import TemplatePreview from "@/components/Templates/TemplatePreview";
import usePaymentPreview from "@/hooks/payments/usePaymentPreview";

/**
 * Rendered payment receipt (template preview). `embedded` is the split-view
 * version: the shared detail header (edit / More / close) replaces the page header.
 */
const PaymentPreview: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const {
    payment,
    templatesLoading,
    mappedInvoiceData,
    showTemplateSelector,
    setShowTemplateSelector,
    handleTemplateSelect,
    handleSendClick,
    handleBackClick,
    handleEdit,
    handleDownloadPDF,
    activeTemplate,
  } = usePaymentPreview();

  if (!payment) {
    return (
      null
    );
  }

  if (templatesLoading && !activeTemplate) {
    return (
      null
    );
  }

  const deletePayment = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/payments/${payment.id}`);
      await invalidatePayments();
      toast.success("Payment deleted successfully", "Deleted");
      setConfirmDelete(false);
      router.push("/payments");
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Failed to delete payment", "Error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={embedded ? "" : "min-h-screen"}>
      {embedded && (
        <ConfirmDialog
          isOpen={confirmDelete}
          title="Delete Payment"
          message="Are you sure you want to delete this payment? This action cannot be undone."
          confirmText={deleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          type="danger"
          onConfirm={deletePayment}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
      <PaymentTemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
        currentTemplateId={
          payment.templateId?.toString() ||
          (
            payment.template as { id?: string | number } | undefined
          )?.id?.toString()
        }
      />

      {embedded ? (
        <div className="px-6 pt-5">
          <DetailHeader
            title={`Payment ${payment.paymentNumber ?? ""}`.trim()}
            subtitle={payment.status ? <StatusBadge status={payment.status} /> : undefined}
            onEdit={paymentEditable(payment.status) ? () => handleEdit(payment.id) : undefined}
            editTitle="Edit payment"
            onClose={() => router.push("/payments")}
            menu={[
              { label: "Send Receipt", onClick: handleSendClick },
              { label: "Download PDF", onClick: handleDownloadPDF },
              { label: "Delete", danger: true, disabled: deleting, onClick: () => setConfirmDelete(true) },
            ]}
          />
        </div>
      ) : (
        <PageHeader
          title={`Payment ${payment.paymentNumber}`}
          showBackButton={true}
          onBack={handleBackClick}
          actions={
            <>
              <Button
                onClick={handleDownloadPDF}
                variant="secondary"
                size="md"
                className="!bg-primary !border !border-primary text-white"
                icon={<Download className="w-4 h-4" />}
              >
                Download
              </Button>
              {paymentEditable(payment.status) && (
                <Button
                  onClick={() => handleEdit(payment.id)}
                  variant="secondary"
                  size="md"
                  icon={<Edit className="w-4 h-4" />}
                >
                  Edit
                </Button>
              )}
              <Button
                onClick={handleSendClick}
                variant="primary"
                size="md"
                icon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
            </>
          }
        />
      )}

      <div className="px-6 py-10 font-sans">
        <div className="relative mx-auto max-w-[210mm]">
          {payment?.status && (
            <div className="absolute top-0 left-0 w-28 h-28 overflow-hidden pointer-events-none z-10">
              <div
                className={`absolute top-[18px] -left-[38px] w-[140px] py-1 text-center text-[10px] font-bold uppercase tracking-wider text-white transform -rotate-45 shadow-sm z-10 ${
                  payment.status.toLowerCase() === "draft"
                    ? "bg-slate-500"
                    : payment.status.toLowerCase() === "sent"
                      ? "bg-primary"
                      : payment.status.toLowerCase() === "paid"
                        ? "bg-emerald-600"
                        : payment.status.toLowerCase() === "partial"
                          ? "bg-amber-500"
                          : "bg-slate-500"
                }`}
              >
                {payment.status}
              </div>
            </div>
          )}

          <div className="absolute top-0 right-0 z-20">
            <div className="relative">
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="flex items-center gap-2 bg-primary/90 hover:bg-primary text-white px-4 py-2 shadow-md transition-all text-sm font-medium pr-3"
              >
                <Settings className="w-4 h-4" />
                <span>Customize</span>
              </button>
            </div>
          </div>

          <div
            id="pdf-print-area"
            className="shadow-lg bg-white relative"
            style={{ minHeight: "296mm" }}
          >
            {activeTemplate && mappedInvoiceData ? (
              <TemplatePreview
                data={activeTemplate}
                invoice={mappedInvoiceData}
              />
            ) : (
              <div className="bg-white p-10 text-center">
                No template found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPreview;
