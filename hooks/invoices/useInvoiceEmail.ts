"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import axios from "@/lib/axios";
import { useProfile } from "@/hooks/auth/useProfile";
import { getNavState } from "@/lib/clientNavState";
import { toast } from "@/components/ui";

export interface EmailData {
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  message: string;
  attachPDF: boolean;
}

export const useInvoiceEmail = (invoiceId: string, initialData?: any) => {
  const router = useRouter();
  const { user } = useProfile();

  const navStateInvoice = useMemo(() => {
    return invoiceId ? getNavState<any>(`invoice:${invoiceId}`) : null;
  }, [invoiceId]);

  const [invoice, setInvoice] = useState<any>(navStateInvoice || initialData);
  const [loading, setLoading] = useState(!invoice);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newEmailInput, setNewEmailInput] = useState("");
  const [activeField, setActiveField] = useState<"to" | "cc" | "bcc" | null>(
    null
  );

  const [emailData, setEmailData] = useState<EmailData>({
    from: user?.email || "",
    to: [],
    cc: [],
    bcc: [],
    subject: "",
    message: "",
    attachPDF: true,
  });

  const [availableEmails, setAvailableEmails] = useState<string[]>([]);

  const prepareEmailData = useCallback(
    (invoiceData: any) => {
      const userEmail = user?.email || "your-email@company.com";
      const companyName = user?.companyName || "Personal";

      const allCustomerEmails: string[] = [];

      if (invoiceData.customerEmail) {
        allCustomerEmails.push(invoiceData.customerEmail);
      }

      if (
        invoiceData.customerId?.email &&
        !allCustomerEmails.includes(invoiceData.customerId.email)
      ) {
        allCustomerEmails.push(invoiceData.customerId.email);
      }

      if (invoiceData.customerId?.contacts) {
        invoiceData.customerId.contacts.forEach((contact: any) => {
          if (contact.email && !allCustomerEmails.includes(contact.email)) {
            allCustomerEmails.push(contact.email);
          }
        });
      }

      if (allCustomerEmails.length === 0 && invoiceData.customer?.email) {
        allCustomerEmails.push(invoiceData.customer.email);
      }

      setAvailableEmails(allCustomerEmails);

      const recipients =
        invoiceData.recipients &&
        Array.isArray(invoiceData.recipients) &&
        invoiceData.recipients.length > 0
          ? invoiceData.recipients
          : allCustomerEmails.length > 0
          ? [allCustomerEmails[0]]
          : [];

      const defaultMessage = `Dear %CustomerName%,

Thank you for choosing to work with us! We truly appreciate your trust and continued partnership.

Please find attached your invoice for the services/products provided. You can view, download, and print the invoice PDF from the attachment below.

INVOICE DETAILS:
Invoice Number: %InvoiceNumber%
Invoice Date: %InvoiceDate%
Due Date: %DueDate%
Amount Due: %Currency% %TotalBalanceDue%

If you have any questions or concerns regarding this invoice, please don't hesitate to reach out. We're here to help!

Thank you once again for your business. We look forward to serving you in the future.

Best regards,
%Sender%
%OrganizationName%`;

      setEmailData({
        from: userEmail,
        to: recipients,
        cc: [userEmail],
        bcc: [],
        subject: "Invoice - %InvoiceNumber% from %OrganizationName%",
        message: defaultMessage,
        attachPDF: true,
      });
    },
    [user]
  );

  useEffect(() => {
    const initialize = async () => {
      if (invoice) {
        prepareEmailData(invoice);
        return;
      }

      if (!invoiceId || invoiceId === "preview" || invoiceId === "draft") {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/invoices/${invoiceId}`);
        const data = response.data.invoice || response.data;
        setInvoice(data);
        prepareEmailData(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        setError("Failed to load invoice data");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [invoiceId, user, invoice, prepareEmailData]);

  const handleSend = async () => {
    if (emailData.to.length === 0) {
      toast.error("Please add at least one recipient", "Send Failed");
      return;
    }

    setSending(true);
    try {
      const targetId = invoiceId;

      if (!targetId || targetId === "preview") {
        if (!invoice) throw new Error("No invoice data to save");
      }

      if (!targetId) throw new Error("Failed to process invoice ID");

      await axios.post(`/invoices/${targetId}/send`, {
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        message: emailData.message,
        subject: emailData.subject,
        attachPDF: emailData.attachPDF,
        invoiceData: invoice,
      });

      toast.success("Invoice sent successfully", "Invoice Sent");
      router.push("/invoices");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send email", "Send Failed");
    } finally {
      setSending(false);
    }
  };

  const MAX_RECIPIENTS_PER_FIELD = 3;

  const addEmail = (type: "to" | "cc" | "bcc", email: string) => {
    const targetList = emailData[type];
    if (targetList.length >= MAX_RECIPIENTS_PER_FIELD) {
      toast.error(
        `You can add up to ${MAX_RECIPIENTS_PER_FIELD} ${type.toUpperCase()} recipients`,
        "Limit Reached",
      );
      return;
    }
    if (!targetList.includes(email)) {
      setEmailData((prev) => ({ ...prev, [type]: [...prev[type], email] }));
    }
  };

  const handleAddEmail = (type: "to" | "cc" | "bcc") => {
    if (newEmailInput.trim() && newEmailInput.includes("@")) {
      addEmail(type, newEmailInput.trim());
      setNewEmailInput("");
      setActiveField(null);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    type: "to" | "cc" | "bcc"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail(type);
    }
  };

  const removeEmail = (type: "to" | "cc" | "bcc", index: number) => {
    setEmailData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const updateMessage = (text: string) => {
    setEmailData((prev) => ({ ...prev, message: text }));
  };

  const updateSubject = (text: string) => {
    setEmailData((prev) => ({ ...prev, subject: text }));
  };

  const toggleAttachPDF = () => {
    setEmailData((prev) => ({ ...prev, attachPDF: !prev.attachPDF }));
  };

  return {
    invoice,
    loading,
    sending,
    error,
    emailData,
    availableEmails,
    newEmailInput,
    activeField,
    setNewEmailInput,
    setActiveField,
    handleSend,
    addEmail,
    handleAddEmail,
    handleKeyDown,
    removeEmail,
    updateMessage,
    updateSubject,
    toggleAttachPDF,
    router,
  };
};

export default useInvoiceEmail;
