"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Send, Edit, Download } from "lucide-react";
import { Button, PageHeader } from "@/components/ui";
import TemplatePreviewComponent from "@/components/Templates/TemplatePreview";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import useTemplatesList from "@/hooks/templates/useTemplatesList";
import useQuote from "@/hooks/quotes/useQuote";
import { downloadPdfFromElement } from "@/utils/invoices/downloadPdfFromElement";
import { quoteToInvoiceDocument } from "@/utils/quotes/quoteInvoiceAdapter";
import type { Quote as QuoteEntity } from "@/entities/Quote";

/** Quote preview/PDF: the invoice template renderer fed with an invoice-shaped quote. */
const QuotePreview: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { quote } = useQuote(id);
  const { templates, loading: templatesLoading } = useTemplatesList();

  const doc = useMemo(() => {
    if (!quote) return null;
    const fallback = templates.find((t) => t.isDefault) || templates[0];
    const withTemplate = {
      ...quote,
      template:
        (quote.template as { templateName?: string } | null)?.templateName
          ? quote.template
          : (templates.find((t) => String(t.id) === String(quote.templateId)) || fallback)?.raw,
    };
    return quoteToInvoiceDocument(withTemplate as unknown as QuoteEntity);
  }, [quote, templates]);

  const handleDownload = async () => {
    const element = document.getElementById("pdf-print-area");
    if (!element || !quote) return;
    try {
      await downloadPdfFromElement(element, `quote-${quote.quoteNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const triggered = useRef(false);
  useEffect(() => {
    if (searchParams?.get("download") !== "1" || !doc?.template || triggered.current) return;
    triggered.current = true;
    const t = setTimeout(async () => {
      await handleDownload();
      router.back();
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, doc]);

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
            {!["Accepted", "Converted"].includes(quote.status) && (
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
