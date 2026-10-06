"use client";

import React from "react";
import { invoiceEditable } from "@/lib/editLock";
import { Send, Edit, Download, Settings } from "lucide-react";
import {
  Button,
  PageHeader,
  ConfirmDialog,
  StatusBadge,
} from "@/components/ui";
import DetailHeader from "@/components/ui/DetailHeader";
import WriteOffModal from "./WriteOffModal";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import useDeleteInvoices from "@/hooks/invoices/useDeleteInvoices";
import useCloneInvoice from "@/hooks/invoices/useCloneInvoice";
import TemplatePreviewComponent from "@/components/Templates/TemplatePreview";
import InvoiceTemplateSelector from "./InvoiceTemplateSelector";
import useInvoicePreview from "@/hooks/invoices/useInvoicePreview";

const NON_WRITE_OFF_STATUSES = ["draft", "paid", "cancelled", "written off"];

/**
 * Rendered invoice (template preview). `embedded` is the split-view version:
 * the shared detail header (edit / More / close) replaces the page header.
 */
const InvoicePreview: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const router = useRouter();
  const deleteHook = useDeleteInvoices();
  const { cloneInvoice, cloning } = useCloneInvoice();
  const {
    invoice,
    templateData,
    templatesLoading,
    showTemplateSelector,
    setShowTemplateSelector,
    handleEdit,
    handleSend,
    handleTemplateSelect,
    handleBackClick,
    handleDownloadPDF,
    activeTemplate,
    writeOffTarget,
    writeOffLoading,
    openWriteOff,
    closeWriteOff,
    submitWriteOff,
  } = useInvoicePreview();

  if (!invoice) {
    return (
      null
    );
  }

  if (templatesLoading && !activeTemplate) {
    return (
      null
    );
  }

  const writtenOff = (invoice.writeOffs || []).reduce(
    (sum: number, w: { amount?: number | string; reversedAt?: unknown }) =>
      sum + (w.reversedAt ? 0 : Number(w.amount || 0)),
    0,
  );
  const balanceDue = Math.max(
    0,
    Number((Number(invoice.total || 0) - Number(invoice.received ?? 0) - writtenOff).toFixed(2)),
  );
  const canWriteOff =
    !NON_WRITE_OFF_STATUSES.includes(String(invoice.status || "").toLowerCase()) && balanceDue > 0;

  return (
    <div className={embedded ? "" : "min-h-screen"}>
      {embedded && (
        <>
          <WriteOffModal
            isOpen={!!writeOffTarget}
            invoiceLabel={writeOffTarget?.invoice || invoice.invoiceNumber}
            remainingAmount={writeOffTarget?.amount ?? balanceDue}
            currency={invoice.currency || "PKR"}
            loading={writeOffLoading}
            onCancel={closeWriteOff}
            onConfirm={submitWriteOff}
          />
          <ConfirmDialog
            isOpen={deleteHook.confirmDialog.show}
            title="Delete Invoice"
            message="Are you sure you want to delete this invoice? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
            onConfirm={deleteHook.confirmDelete}
            onCancel={deleteHook.hideConfirmDialog}
          />
        </>
      )}
      <InvoiceTemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
        currentTemplateId={String(templateData?.id)}
      />

      {embedded ? (
        <div className="px-6 pt-5">
          <DetailHeader
            title={invoice.invoiceNumber}
            subtitle={<StatusBadge status={invoice.status || "Draft"} />}
            onEdit={invoiceEditable(invoice.status) ? handleEdit : undefined}
            editTitle="Edit invoice"
            onClose={() => router.push("/invoices")}
            menu={[
              { label: "Send Invoice", onClick: handleSend },
              { label: "Download PDF", onClick: handleDownloadPDF },
          { label: "Clone", disabled: cloning, hidden: !invoice.id, onClick: () => cloneInvoice(invoice) },
              {
                label: "Write Off",
                hidden: !canWriteOff || !invoice.id,
                onClick: () =>
                  openWriteOff({
                    id: invoice.id,
                    invoice: invoice.invoiceNumber,
                    amount: balanceDue,
                  }),
              },
              {
                label: "Delete",
                danger: true,
                hidden: !invoice.id, // an unsaved preview has nothing to delete
                onClick: () => deleteHook.deleteInvoices([invoice.id], () => router.push("/invoices")),
              },
            ]}
          />
        </div>
      ) : (
        <PageHeader
          title={`Invoice ${invoice.invoiceNumber}`}
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
              {invoiceEditable(invoice.status) && (
                <Button
                  onClick={handleEdit}
                  variant="secondary"
                  size="md"
                  icon={<Edit className="w-4 h-4" />}
                >
                  Edit
                </Button>
              )}
              <Button
                onClick={handleSend}
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
          {invoice?.status && (
            <div className="absolute top-0 left-0 w-28 h-28 overflow-hidden pointer-events-none z-10">
              <div
                className={`absolute top-[18px] -left-[38px] w-[140px] py-1 text-center text-[10px] font-bold uppercase tracking-wider text-white transform -rotate-45 shadow-sm z-10 ${
                  invoice.status.toLowerCase() === "draft"
                    ? "bg-slate-500"
                    : invoice.status.toLowerCase() === "sent"
                      ? "bg-primary"
                      : invoice.status.toLowerCase() === "paid"
                        ? "bg-emerald-600"
                        : invoice.status.toLowerCase() === "overdue"
                          ? "bg-rose-600"
                          : invoice.status.toLowerCase() === "written off"
                            ? "bg-violet-600"
                            : "bg-slate-500"
                }`}
              >
                {invoice.status}
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
            {templateData ? (
              <TemplatePreviewComponent data={templateData} invoice={invoice} />
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

export default InvoicePreview;
