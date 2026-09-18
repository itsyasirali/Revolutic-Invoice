"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import useInvoicePreview from "./useInvoicePreview";
import type { Invoice } from "@/types/invoice";
import type { BadgeVariant } from "@/types/common";

const useInvoiceDetails = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { invoice, handleSend } = useInvoicePreview();

  const handlePreviewPdf = () => {
    if (invoice) {
      router.push(`/invoices/preview/${invoice.id || invoice._id}`);
    }
  };

  const invoiceNumberDisplay = useMemo(() => {
    if (!invoice) return "INV-0001";
    return (
      invoice.invoiceNumber ||
      invoice.invoice ||
      `INV-${String(invoice.id || "").padStart(4, "0")}`
    );
  }, [invoice]);

  const currency = invoice?.currency || "PKR";

  const customerName = useMemo(() => {
    if (!invoice) return "Customer";
    return (
      invoice.customerDisplayName ||
      invoice.customer?.displayName ||
      invoice.customer?.companyName ||
      "Unnamed Customer"
    );
  }, [invoice]);

  const customerEmail = useMemo(() => {
    if (!invoice) return "No email provided";
    return (
      invoice.customerEmail ||
      invoice.customer?.email ||
      invoice.customer?.contacts?.[0]?.email ||
      "No email provided"
    );
  }, [invoice]);

  const customerPhone = useMemo(() => {
    if (!invoice) return "No phone provided";
    return (
      invoice.customer?.phone ||
      invoice.customer?.contacts?.[0]?.contact ||
      "No phone provided"
    );
  }, [invoice]);

  const customerAddress = useMemo(() => {
    if (!invoice) return "No address provided";
    return invoice.customer?.address || "No address provided";
  }, [invoice]);

  const issueDateFormatted = useMemo(() => {
    if (!invoice?.invoiceDate) return "N/A";
    try {
      const d = new Date(invoice.invoiceDate);
      if (isNaN(d.getTime())) return invoice.invoiceDate;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return invoice.invoiceDate;
    }
  }, [invoice]);

  const dueDateFormatted = useMemo(() => {
    if (!invoice?.dueDate) return "N/A";
    try {
      const d = new Date(invoice.dueDate);
      if (isNaN(d.getTime())) return invoice.dueDate;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return invoice.dueDate;
    }
  }, [invoice]);

  const calculateSubtotal = useMemo(() => {
    if (!invoice) return 0;
    if (invoice.subTotal !== undefined) return Number(invoice.subTotal) || 0;
    return (invoice.items || []).reduce(
      (acc: number, item: Invoice["items"][0]) =>
        acc + (Number(item.amount) || 0),
      0,
    );
  }, [invoice]);

  const subtotal = calculateSubtotal;
  const discountPercent = Number(invoice?.discountPercent || 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = Number(invoice?.total ?? subtotal - discountAmount);
  const amountPaid = Number(invoice?.amountReceived ?? invoice?.received ?? 0);
  const balanceDue = Number(
    invoice?.remaining ?? Math.max(0, total - amountPaid),
  );

  const statusText = useMemo(() => {
    if (!invoice?.status) return "Draft";
    if (typeof invoice.status === "string") return invoice.status;
    return invoice.status.tooltip || "Draft";
  }, [invoice]);

  const statusVariant = useMemo<BadgeVariant>(() => {
    const s = statusText.toLowerCase();
    if (s.includes("paid") && !s.includes("partially")) return "success";
    if (s.includes("partially")) return "warning";
    if (s.includes("overdue")) return "danger";
    if (s.includes("sent")) return "info";
    return "gray";
  }, [statusText]);

  return {
    mounted,
    invoice,
    handleSend,
    handlePreviewPdf,
    invoiceNumberDisplay,
    currency,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    issueDateFormatted,
    dueDateFormatted,
    subtotal,
    discountPercent,
    discountAmount,
    total,
    amountPaid,
    balanceDue,
    statusText,
    statusVariant,
  };
};

export default useInvoiceDetails;
