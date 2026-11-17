"use client";

import { useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import useRouter from "@/hooks/organization/useOrgRouter";
import useTemplatesList from "@/hooks/templates/useTemplatesList";
import useQuote from "@/hooks/quotes/useQuote";
import { downloadPdfFromElement } from "@/utils/invoices/downloadPdfFromElement";
import { quoteToInvoiceDocument } from "@/utils/quotes/quoteInvoiceAdapter";
import type { Quote as QuoteEntity } from "@/entities/Quote";

/** Quote preview: resolves the template, builds the document and handles ?download=1. */
const useQuotePreview = () => {
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

  const downloading = searchParams?.get("download") === "1";

  return { quote, doc, templatesLoading, handleDownload, downloading, router };
};

export default useQuotePreview;
