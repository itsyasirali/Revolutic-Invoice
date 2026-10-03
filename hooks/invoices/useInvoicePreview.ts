"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import type { TemplateListItem } from "@/types/template";
import useTemplatesList from "@/hooks/templates/useTemplatesList";
import useUpdateInvoice from "./useUpdateInvoice";
import useWriteOffInvoice from "./useWriteOffInvoice";
import { getNavState, setNavState } from "@/lib/clientNavState";
import axios from "@/lib/axios";
import { downloadPdfFromElement } from "@/utils/invoices/downloadPdfFromElement";

export const useInvoicePreview = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { templates, loading: templatesLoading } = useTemplatesList();
  const { updateInvoice } = useUpdateInvoice();

  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [localTemplate, setLocalTemplate] = useState<TemplateListItem | null>(
    null
  );
  const [fetchedInvoice, setFetchedInvoice] = useState<any>(null);

  const fetchInvoice = () => {
    if (id && id !== "draft") {
      axios
        .get(`/invoices/${id}`)
        .then((res) => {
          if (res.data?.invoice || res.data) {
            setFetchedInvoice(res.data?.invoice || res.data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch invoice details:", err);
        });
    }
  };

  useEffect(() => {
    // Show cached nav-state data instantly, then always refetch to get
    // complete server-side data (e.g. write-off history) the cached copy lacks.
    const navStateInvoice = id ? getNavState<any>(`invoice:${id}`) : undefined;
    if (navStateInvoice) {
      setFetchedInvoice(
        (navStateInvoice as { raw?: unknown }).raw ?? navStateInvoice
      );
    }
    if (!(navStateInvoice as { unsavedPreview?: boolean } | undefined)?.unsavedPreview) {
      fetchInvoice();
    }
  }, [id]);

  const invoice = fetchedInvoice;

  const {
    target: writeOffTarget,
    loading: writeOffLoading,
    openWriteOff,
    closeWriteOff,
    submitWriteOff,
    reverseWriteOff,
  } = useWriteOffInvoice(fetchInvoice);

  const activeTemplate = useMemo(() => {
    if (localTemplate) return localTemplate;
    if (!invoice) return null;

    if (
      invoice.template &&
      typeof invoice.template === "object" &&
      (invoice.template.id || invoice.template.id)
    ) {
      if (invoice.template.templateName || invoice.template.name) {
        return invoice.template;
      }
    }

    if (templatesLoading) return null;

    let tId = invoice.templateId;
    if (typeof tId === "object" && tId !== null) {
      tId = tId.id || tId.id;
    } else if (!tId && invoice.template) {
      tId = invoice.template.id || invoice.template.id;
    }

    if (tId) {
      const found = templates.find((t) => String(t.id) === String(tId));
      if (found) return found;
    }
    return templates.find((t) => t.isDefault) || templates[0];
  }, [invoice, templates, templatesLoading, localTemplate]);

  const handleEdit = () => {
    if (invoice) {
      const targetId = id && id !== "draft" ? id : invoice.id;
      if (targetId) {
        // Match the shape used elsewhere (e.g. the invoice list) when caching
        // nav state, so useInvoiceForm's `.raw ?? navInvoice` unwrapping logic
        // resolves the same way regardless of where the edit navigation came from.
        setNavState(`invoice:${targetId}`, { raw: invoice });
        router.push(`/invoices/edit/${targetId}`);
      } else {
        router.push(`/invoices/new`);
      }
    }
  };

  const handleSend = () => {
    if (invoice) {
      const resolvedTemplate = activeTemplate?.raw || activeTemplate;
      const invoiceToSend = {
        ...invoice,
        template: resolvedTemplate,
        templateId: resolvedTemplate?.id,
      };

      const targetId = id && id !== "draft" ? id : "draft";
      setNavState(`invoice:${targetId}`, invoiceToSend);
      router.push(`/invoices/${targetId}/email`);
    }
  };

  const handleTemplateSelect = async (template: TemplateListItem) => {
    setLocalTemplate(template);
    setShowTemplateSelector(false);

    if (id && id !== "draft") {
      try {
        await updateInvoice(id, { templateId: template.id });
      } catch (error) {
        console.error("Failed to update template:", error);
      }
    }
  };

  const handleBackClick = () => {
    router.push("/invoices");
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("pdf-print-area");
    if (!element) return;

    try {
      await downloadPdfFromElement(
        element,
        `invoice-${invoice?.invoiceNumber || "draft"}.pdf`,
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const templateData = activeTemplate?.raw || activeTemplate;

  // Auto-download support: navigate to preview?download=1 to trigger PDF download
  const searchParams = useSearchParams();
  const hasTriggeredDownload = useRef(false);

  useEffect(() => {
    if (
      searchParams?.get("download") === "1" &&
      invoice &&
      templateData &&
      !hasTriggeredDownload.current
    ) {
      hasTriggeredDownload.current = true;
      // Give the template a moment to render into #pdf-print-area
      const timer = setTimeout(async () => {
        await handleDownloadPDF();
        router.back();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [searchParams, invoice, templateData]);

  return {
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
    reverseWriteOff,
  };
};

export default useInvoicePreview;
