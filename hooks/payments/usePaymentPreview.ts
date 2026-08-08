"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Payment } from "@/types/payment";
import usePaymentActions from "./usePaymentActions";
import useTemplates from "./useTemplates";
import { getNavState, setNavState } from "@/lib/clientNavState";
import axios from "@/lib/axios";

export interface UsePaymentPreviewReturn {
  id: string | undefined;
  payment: Payment | null;
  templates: any[];
  templatesLoading: boolean;
  selectedTemplate: any;
  mappedInvoiceData: any;
  showTemplateSelector: boolean;
  setShowTemplateSelector: (show: boolean) => void;
  availableRecipients: string[];
  selectedRecipients: string[];
  handleRecipientToggle: (email: string) => void;
  handleTemplateSelect: (template: any) => Promise<void>;
  handleSendClick: () => void;
  handleDownloadPDF: () => Promise<void>;
  handleBackClick: () => void;
  handleEdit: (id: string) => void;
  activeTemplate: any;
}

const usePaymentPreview = (): UsePaymentPreviewReturn => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [fetchedPayment, setFetchedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    const navStatePayment = id ? getNavState<Payment>(`payment:${id}`) : null;
    if (navStatePayment) {
      setFetchedPayment(navStatePayment);
    } else if (id && id !== "draft") {
      axios
        .get(`/payments/${id}`)
        .then((res) => {
          if (res.data?.payment || res.data) {
            setFetchedPayment(res.data?.payment || res.data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch payment details:", err);
        });
    }
  }, [id]);

  const payment = fetchedPayment;

  const { handleBackToList, handleEdit, updateTemplate } = usePaymentActions();
  const { templates, loading: templatesLoading, defaultTemplate } = useTemplates();

  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [availableRecipients, setAvailableRecipients] = useState<string[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  useEffect(() => {
    if (payment) {
      const emails: string[] = [];

      if (payment.customerEmail) {
        emails.push(payment.customerEmail);
      }

      if (
        payment.customer?.email &&
        !emails.includes(payment.customer.email)
      ) {
        emails.push(payment.customer.email);
      }

      if (
        payment.customer?.contacts &&
        Array.isArray(payment.customer.contacts)
      ) {
        payment.customer.contacts.forEach((c: any) => {
          if (c.email && !emails.includes(c.email)) {
            emails.push(c.email);
          }
        });
      }

      setAvailableRecipients(emails);
      setSelectedRecipients(emails);
    }
  }, [payment]);

  const handleRecipientToggle = (email: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  };

  const selectedTemplate = useMemo(() => {
    let baseTemplate = null;

    if (payment) {
      if (payment.template && typeof payment.template === "object") {
        baseTemplate =
          "raw" in payment.template
            ? (payment.template as any).raw
            : payment.template;
      }

      if (!baseTemplate && templates.length > 0) {
        const templateId =
          payment.templateId?.toString() ||
          (payment.template as any)?.id?.toString();
        if (templateId) {
          const found = templates.find((t) => t.id === templateId);
          if (found) baseTemplate = found.raw;
        }
      }

      if (!baseTemplate && defaultTemplate) {
        baseTemplate = defaultTemplate.raw;
      }

      if (!baseTemplate) {
        baseTemplate = templates[0]?.raw || null;
      }
    }

    if (baseTemplate) {
      return {
        ...baseTemplate,
        invoiceLabel: "PAYMENT",
        invoiceDateLabel: "Payment Date",
        termsLabel: "Payment Mode",
        dueDateLabel: "Reference#",
        subtotalLabel: "Amount Received",
        balanceDueLabel: "Total",
        showTotal: false,
        showPreviousDue: false,
        showNotes: false,
        tableColumnSettings: [],
        tableColumns: [
          {
            key: "invoiceNumber",
            label: "Invoice Number",
            width: 200,
            align: "left",
            enabled: true,
          },
          {
            key: "invoiceAmount",
            label: "Invoice Amount",
            width: 150,
            align: "right",
            enabled: true,
          },
          {
            key: "paymentAmount",
            label: "Payment Amount",
            width: 150,
            align: "right",
            enabled: true,
          },
        ],
      };
    }

    return null;
  }, [payment, templates, defaultTemplate]);

  const mappedInvoiceData = useMemo(() => {
    if (!payment) return null;

    return {
      invoiceNumber: payment.paymentNumber
        ? `#${payment.paymentNumber}`
        : "N/A",
      invoiceDate: payment.paymentDate,
      formattedDueDate: payment.referenceNo || "N/A",
      terms: payment.paymentMode || "N/A",
      customerId: payment.customer,
      customerDisplayName: payment.customerDisplayName,
      customerAddress: payment.customer?.address || "",
      customerEmail: payment.customerEmail,
      customer: payment.customer,
      items: (payment.appliedInvoices || []).map((applied: any) => ({
        invoiceNumber: applied.invoiceNumber || applied.invoiceId || "N/A",
        invoiceAmount: (
          applied.invoiceAmount ||
          applied.invoice?.total ||
          applied.totalAmount ||
          0
        ).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        paymentAmount: (applied.amount ?? 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        title: `Invoice: ${applied.invoiceNumber || applied.invoiceId || "N/A"}`,
        description: `Invoice Amount: ${applied.invoiceAmount || 0}`,
        quantity: 1,
        rate: applied.amount || 0,
        amount: applied.amount || 0,
      })),
      subTotal: payment.amountReceived || 0,
      subtotal: payment.amountReceived || 0,
      total: payment.amountReceived || 0,
      remaining: payment.amountReceived || 0,
      previousRemaining: 0,
      currency: payment.currency || "PKR",
      notes:
        (payment.bankCharges ?? 0) > 0
          ? `Bank Charges: ${payment.bankCharges}`
          : "",
    };
  }, [payment]);

  const handleTemplateSelect = async (template: any) => {
    if (!id) return;
    try {
      await updateTemplate(id, template.id);
      router.refresh();
    } catch (error) {
      console.error("Error updating template:", error);
    }
    setShowTemplateSelector(false);
  };

  const handleSendClick = () => {
    if (payment) {
      const targetId = id || payment.id;
      setNavState(`payment:${targetId}`, payment);
      router.push(`/payments/${targetId}/email`);
    }
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

      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: 0,
        filename: `payment-${payment?.paymentNumber || "receipt"}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      await html2pdf().from(element).set(opt).save();

      imageConversions.forEach(({ img, originalSrc }) => {
        img.src = originalSrc;
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleEditWrapper = (editId: string) => {
    handleEdit(editId, payment);
  };

  return {
    id,
    payment,
    templates,
    templatesLoading,
    selectedTemplate,
    mappedInvoiceData,
    showTemplateSelector,
    setShowTemplateSelector,
    availableRecipients,
    selectedRecipients,
    handleRecipientToggle,
    handleTemplateSelect,
    handleSendClick,
    handleDownloadPDF,
    handleBackClick: handleBackToList,
    handleEdit: handleEditWrapper,
    activeTemplate: selectedTemplate,
  };
};

export default usePaymentPreview;
