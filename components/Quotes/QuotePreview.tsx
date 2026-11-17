"use client";

import React from "react";
import { quoteEditable } from "@/lib/editLock";
import { Send, Edit, Download } from "lucide-react";
import { Button, PageHeader } from "@/components/ui";
import TemplatePreviewComponent from "@/components/Templates/TemplatePreview";
import useQuotePreview from "@/hooks/quotes/useQuotePreview";

/** Quote preview/PDF: the invoice template renderer fed with an invoice-shaped quote. */
const QuotePreview: React.FC = () => {
  const { quote, doc, templatesLoading, handleDownload, downloading, router } = useQuotePreview();

  if (!quote || !doc || (templatesLoading && !doc.template)) return null;

  const status = quote.status.toLowerCase();
  const ribbon =
    status === "accepted" || status === "converted"
      ? "bg-emerald-600"
      : status === "declined" || status === "expired"
        ? "bg-rose-600"
        : status === "sent" || status === "viewed"
          ? "bg-primary"
          : "bg-slate-500";

  return (
    <div className="min-h-screen">
      {downloading && (
        <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center text-sm font-medium text-slate-600">
          Preparing your PDF…
        </div>
      )}
      <PageHeader
        title={`Quote ${quote.quoteNumber}`}
        onBack={() => router.push(`/quotes/${quote.id}`)}
        actions={
          <>
            <Button
              onClick={handleDownload}
              variant="secondary"
              size="md"
              className="!bg-primary !border !border-primary text-white"
              icon={<Download className="w-4 h-4" />}
            >
              Download
            </Button>
            {quoteEditable(quote.status) && (
              <Button
                onClick={() => router.push(`/quotes/edit/${quote.id}`)}
                variant="secondary"
                size="md"
                icon={<Edit className="w-4 h-4" />}
              >
                Edit
              </Button>
            )}
            {["Draft", "Sent", "Viewed"].includes(quote.status) && (
              <Button
                onClick={() => router.push(`/quotes/${quote.id}/email`)}
                variant="primary"
                size="md"
                icon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
            )}
          </>
        }
      />

      <div className="px-6 py-10 font-sans">
        <div className="relative mx-auto max-w-[210mm]">
          <div className="absolute top-0 left-0 w-28 h-28 overflow-hidden pointer-events-none z-10">
            <div
              className={`absolute top-[18px] -left-[38px] w-[140px] py-1 text-center text-[10px] font-bold uppercase tracking-wider text-white transform -rotate-45 shadow-sm z-10 ${ribbon}`}
            >
              {quote.status}
            </div>
          </div>

          <div
            id="pdf-print-area"
            className="shadow-lg bg-white relative"
            style={{ minHeight: "296mm" }}
          >
            {doc.template ? (
              <TemplatePreviewComponent
                data={(doc.template as { raw?: unknown }).raw ?? doc.template}
                invoice={doc as never}
              />
            ) : (
              <div className="bg-white p-10 text-center">No template found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotePreview;
