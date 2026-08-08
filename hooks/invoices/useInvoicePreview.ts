"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { TemplateListItem } from "@/types/template";
import useTemplatesList from "@/hooks/templates/useTemplatesList";
import useUpdateInvoice from "./useUpdateInvoice";
import { getNavState, setNavState } from "@/lib/clientNavState";
import axios from "@/lib/axios";

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

  useEffect(() => {
    const navStateInvoice = id ? getNavState<any>(`invoice:${id}`) : undefined;
    if (navStateInvoice) {
      setFetchedInvoice(navStateInvoice);
    } else if (id && id !== "draft") {
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
  }, [id]);

  const invoice = fetchedInvoice;

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
        setNavState(`invoice:${targetId}`, invoice);
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
      const images = Array.from(
        element.querySelectorAll("img")
      ) as HTMLImageElement[];
      const imageConversions: Array<{
        img: HTMLImageElement;
        originalSrc: string;
        dataUrl: string;
      }> = [];

      for (const img of images) {
        if (img.src && !img.src.startsWith("data:")) {
          try {
            const corsImage = new Image();
            corsImage.crossOrigin = "anonymous";

            await new Promise<void>((resolve, reject) => {
              corsImage.onload = () => resolve();
              corsImage.onerror = () => {
                const fallbackImage = new Image();
                fallbackImage.onload = () => {
                  Object.assign(corsImage, {
                    width: fallbackImage.width,
                    height: fallbackImage.height,
                    naturalWidth: fallbackImage.naturalWidth,
                    naturalHeight: fallbackImage.naturalHeight,
                  });
                  const tempCanvas = document.createElement("canvas");
                  tempCanvas.width =
                    fallbackImage.naturalWidth || fallbackImage.width;
                  tempCanvas.height =
                    fallbackImage.naturalHeight || fallbackImage.height;
                  const tempCtx = tempCanvas.getContext("2d");
                  if (tempCtx) {
                    try {
                      tempCtx.drawImage(fallbackImage, 0, 0);
                      resolve();
                    } catch (e) {
                      reject(e);
                    }
                  } else {
                    reject(new Error("Could not get canvas context"));
                  }
                };
                fallbackImage.onerror = reject;
                fallbackImage.src = img.src;
              };
              corsImage.src = img.src;
            });

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) continue;

            canvas.width =
              corsImage.naturalWidth ||
              corsImage.width ||
              img.naturalWidth ||
              img.width;
            canvas.height =
              corsImage.naturalHeight ||
              corsImage.height ||
              img.naturalHeight ||
              img.height;

            ctx.drawImage(corsImage, 0, 0);
            const dataUrl = canvas.toDataURL("image/png");

            imageConversions.push({
              img,
              originalSrc: img.src,
              dataUrl,
            });
          } catch (error) {
            console.error("Failed to convert image:", img.src, error);
          }
        }
      }

      imageConversions.forEach(({ img, dataUrl }) => {
        img.src = dataUrl;
      });

      await new Promise((resolve) => setTimeout(resolve, 300));

      const html2pdf = await import("html2pdf.js");
      const opt = {
        margin: 0,
        filename: `invoice-${invoice?.invoiceNumber || "draft"}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          logging: false,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      await html2pdf.default().from(element).set(opt).save();

      imageConversions.forEach(({ img, originalSrc }) => {
        img.src = originalSrc;
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const templateData = activeTemplate?.raw || activeTemplate;

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
  };
};

export default useInvoicePreview;
