"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "@/lib/axios";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import { useProfile } from "@/hooks/auth/useProfile";
import { toast } from "@/components/ui";
import { invalidateQuotes } from "@/lib/swr";
import { quoteToInvoiceDocument } from "@/utils/quotes/quoteInvoiceAdapter";
import { useQuote } from "./useQuote";
import type { EmailData } from "@/hooks/invoices/useInvoiceEmail";
import type { Quote as QuoteEntity } from "@/entities/Quote";

const MAX_RECIPIENTS_PER_FIELD = 3;
type Field = "to" | "cc" | "bcc";

const DEFAULT_MESSAGE = `Dear %CustomerName%,

Thank you for your interest in working with us! Please find attached our quote for the services/products discussed.

QUOTE DETAILS:
Quote Number: %InvoiceNumber%
Quote Date: %InvoiceDate%
Valid Until: %DueDate%
Total: %Currency% %TotalBalanceDue%

If you have any questions or would like to proceed, please don't hesitate to reach out. We're here to help!

Best regards,
%Sender%
%OrganizationName%`;

/** Compose/send state for a quote email. Same shape as useInvoiceEmail. */
const useQuoteEmail = (quoteId: string) => {
  const router = useRouter();
  const { user } = useProfile();
  const { quote, loading } = useQuote(quoteId);

  const [sending, setSending] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [activeField, setActiveField] = useState<Field | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [emailData, setEmailData] = useState<EmailData>({
    from: user?.email || "",
    to: [],
    cc: [],
    bcc: [],
    subject: "",
    message: "",
    attachPDF: true,
  });

  useEffect(() => {
    if (!quote || initialized) return;
    const userEmail = user?.email || "";
    const firstEmail =
      quote.customer?.contacts?.find((c) => c.email)?.email ||
      (quote.customer as { email?: string } | null)?.email;
    setEmailData({
      from: userEmail,
      to: firstEmail ? [firstEmail] : [],
      cc: userEmail ? [userEmail] : [],
      bcc: [],
      subject: "Quote - %InvoiceNumber% from %OrganizationName%",
      message: DEFAULT_MESSAGE,
      attachPDF: true,
    });
    setInitialized(true);
  }, [quote, user, initialized]);

  // Invoice-shaped record so the shared placeholder picker resolves quote values.
  const placeholderRecord = useMemo(
    () => (quote ? quoteToInvoiceDocument(quote as unknown as QuoteEntity) : null),
    [quote],
  );

  const addEmail = (type: Field, email: string) => {
    if (emailData[type].length >= MAX_RECIPIENTS_PER_FIELD) {
      toast.error(
        `You can add up to ${MAX_RECIPIENTS_PER_FIELD} ${type.toUpperCase()} recipients`,
        "Limit Reached",
      );
      return;
    }
    if (!emailData[type].includes(email)) {
      setEmailData((prev) => ({ ...prev, [type]: [...prev[type], email] }));
    }
  };

  const handleAddEmail = (type: Field) => {
    if (newEmailInput.trim() && newEmailInput.includes("@")) {
      addEmail(type, newEmailInput.trim());
      setNewEmailInput("");
      setActiveField(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: Field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail(type);
    }
  };

  const removeEmail = (type: Field, index: number) =>
    setEmailData((prev) => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));

  const handleSend = async () => {
    if (emailData.to.length === 0) {
      toast.error("Please add at least one recipient", "Send Failed");
      return;
    }
    setSending(true);
    try {
      await axios.post(`/quotes/${quoteId}/send`, {
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        message: emailData.message,
        subject: emailData.subject,
        attachPDF: emailData.attachPDF,
      });
      await invalidateQuotes();
      toast.success("Quote sent successfully", "Quote Sent");
      router.push(`/quotes/${quoteId}`);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to send email", "Send Failed");
    } finally {
      setSending(false);
    }
  };

  return {
    quote,
    placeholderRecord,
    loading,
    sending,
    emailData,
    newEmailInput,
    activeField,
    setNewEmailInput,
    setActiveField,
    handleSend,
    handleAddEmail,
    handleKeyDown,
    removeEmail,
    updateMessage: (message: string) => setEmailData((p) => ({ ...p, message })),
    updateSubject: (subject: string) => setEmailData((p) => ({ ...p, subject })),
    toggleAttachPDF: () => setEmailData((p) => ({ ...p, attachPDF: !p.attachPDF })),
    router,
  };
};

export default useQuoteEmail;
