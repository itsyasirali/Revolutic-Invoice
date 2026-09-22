"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

export const usePaymentEmail = (paymentId: string, initialData?: any) => {
  const router = useRouter();
  const { user } = useProfile();

  const navStatePayment = useMemo(() => {
    return paymentId ? getNavState<any>(`payment:${paymentId}`) : null;
  }, [paymentId]);

  const [payment, setPayment] = useState<any>(navStatePayment || initialData);
  const [loading, setLoading] = useState(!payment);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [activeField, setActiveField] = useState<"to" | "cc" | "bcc" | null>(
    null
  );

  const [emailData, setEmailData] = useState<EmailData>({
    from: "",
    to: [],
    cc: [],
    bcc: [],
    subject: "",
    message: "",
    attachPDF: true,
  });

  const [availableEmails, setAvailableEmails] = useState<string[]>([]);

  const prepareEmailData = useCallback(
    (paymentData: any) => {
      const userEmail = user?.email || "your-email@company.com";
      const companyName = user?.companyName || "Personal";

      const allCustomerEmails: string[] = [];

      if (paymentData.customerEmail) {
        allCustomerEmails.push(paymentData.customerEmail);
      }

      if (
        paymentData.customer?.email &&
        !allCustomerEmails.includes(paymentData.customer.email)
      ) {
        allCustomerEmails.push(paymentData.customer.email);
      }

      if (paymentData.customer?.contacts) {
        paymentData.customer.contacts.forEach((contact: any) => {
          if (contact.email && !allCustomerEmails.includes(contact.email)) {
            allCustomerEmails.push(contact.email);
          }
        });
      }

      setAvailableEmails(allCustomerEmails);

      const recipients =
        allCustomerEmails.length > 0 ? [allCustomerEmails[0]] : [];

      const defaultMessage = `Dear %CustomerName%,

Thank you for your payment. We have received it and processed it successfully.

Please find attached your payment receipt for your records.

PAYMENT DETAILS:
Receipt Number: %PaymentNumber%
Payment Date: %PaymentDate%
Amount Received: %Currency% %PaymentAmount%

If you have any questions, please feel free to contact us.

Thank you for your business.

Best regards,
%Sender%
%OrganizationName%`;

      setEmailData({
        from: userEmail,
        to: recipients,
        cc: [userEmail],
        bcc: [],
        subject: "Payment Receipt - %PaymentNumber% from %OrganizationName%",
        message: defaultMessage,
        attachPDF: true,
      });
    },
    [user]
  );

  useEffect(() => {
    const initialize = async () => {
      let data = payment;

      if (data) {
        prepareEmailData(data);
        setLoading(false);
        return;
      }

      if (!paymentId || paymentId === "preview" || paymentId === "draft") {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/payments/${paymentId}`);
        data = response.data.payment || response.data;
        setPayment(data);
        prepareEmailData(data);
      } catch (error) {
        console.error("Error fetching payment:", error);
        setError("Failed to load payment data");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [paymentId, payment, user, prepareEmailData]);

  const handleSend = async () => {
    if (emailData.to.length === 0) {
      toast.error("Please add at least one recipient", "Send Failed");
      return;
    }

    setSending(true);
    try {
      const targetId = paymentId;

      if (!targetId || targetId === "preview" || targetId === "draft") {
        throw new Error(
          "Cannot send draft payment directly from this hook yet"
        );
      }

      await axios.post(`/payments/${targetId}/send`, {
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        message: emailData.message,
        subject: emailData.subject,
        attachPDF: emailData.attachPDF,
      });

      toast.success("Payment receipt sent successfully", "Payment Sent");
      router.push("/payments");
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

  const removeEmail = (type: "to" | "cc" | "bcc", index: number) => {
    setEmailData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const updateSubject = (text: string) => {
    setEmailData((prev) => ({ ...prev, subject: text }));
  };

  const updateMessage = (text: string) => {
    setEmailData((prev) => ({ ...prev, message: text }));
  };

  const toggleAttachPDF = () => {
    setEmailData((prev) => ({ ...prev, attachPDF: !prev.attachPDF }));
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

  return {
    payment,
    loading,
    sending,
    error,
    emailData,
    availableEmails,
    handleSend,
    addEmail,
    removeEmail,
    updateMessage,
    updateSubject,
    toggleAttachPDF,
    newEmailInput,
    setNewEmailInput,
    activeField,
    setActiveField,
    handleAddEmail,
    handleKeyDown,
    router,
  };
};

export default usePaymentEmail;
