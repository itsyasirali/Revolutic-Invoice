"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/components/ui";
import useCustomerDetailsView from "@/hooks/customers/useCustomerDetailsView";
import useRouter from "@/hooks/organization/useOrgRouter";
import { useCustomerStatement, type StatementRange } from "@/components/customer/CustomerStatement";

export type StatementEmailField = "to" | "cc" | "bcc";
const MAX_PER_FIELD = 3;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Compose and send a customer statement by email. */
const useCustomerStatementEmail = () => {
  const router = useRouter();
  const search = useSearchParams();
  const initialRange = {
    range: (search?.get("range") as StatementRange) || "all",
    from: search?.get("from") || "",
    to: search?.get("to") || "",
  };
  const {
    customer,
    loading,
    customerInvoices,
    customerTransactions,
    customerIdDisplay,
    billingAddressLines,
    currency,
    contactList,
  } = useCustomerDetailsView();

  const statement = useCustomerStatement({
    customerName: customer?.displayName || customer?.companyName || "Customer",
    customerId: customerIdDisplay,
    customerRecordId: customer?.id ?? "",
    currency,
    address: billingAddressLines.join("\n"),
    invoices: customerInvoices,
    transactions: customerTransactions,
    initialRange,
  });

  const [emails, setEmails] = useState<Record<StatementEmailField, string[]>>({ to: [], cc: [], bcc: [] });
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [activeField, setActiveField] = useState<StatementEmailField | null>(null);
  const [input, setInput] = useState("");
  const initialised = useRef(false);

  useEffect(() => {
    if (!customer || initialised.current) return;
    initialised.current = true;
    const all = Array.from(
      new Set(
        [customer.email, ...contactList.map((c) => c.email)].filter(
          (e): e is string => !!e && EMAIL_RE.test(e),
        ),
      ),
    );
    setEmails({ to: all.slice(0, 1), cc: [], bcc: [] });
    setMessage(
      `Dear ${customer.displayName || customer.companyName || "Customer"},

Please find attached your statement of account for your records.

If you have any questions, please feel free to contact us.

Thank you for your business.`,
    );
    setSubject(
      `Statement of Account - ${customer.displayName || customer.companyName || ""}`.trim(),
    );
  }, [customer, contactList]);

  const add = (type: StatementEmailField) => {
    const value = input.trim();
    if (!value) return;
    if (!EMAIL_RE.test(value)) {
      toast.error("Please enter a valid email address", "Invalid Email");
      return;
    }
    if (emails[type].length >= MAX_PER_FIELD) {
      toast.error(
        `You can add up to ${MAX_PER_FIELD} ${type.toUpperCase()} recipients`,
        "Limit Reached",
      );
      return;
    }
    if (!emails[type].includes(value)) {
      setEmails((p) => ({ ...p, [type]: [...p[type], value] }));
    }
    setInput("");
    setActiveField(null);
  };

  const remove = (type: StatementEmailField, idx: number) =>
    setEmails((p) => ({ ...p, [type]: p[type].filter((_, i) => i !== idx) }));

  const handleSend = async () => {
    if (emails.to.length === 0) {
      toast.error("Please add at least one recipient", "Send Failed");
      return;
    }
    setSending(true);
    try {
      await statement.sendEmail({ ...emails, subject, message });
      toast.success("Statement sent successfully", "Statement Sent");
      if (customer) router.push(`/customers/${customer.id}`);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to send email", "Send Failed");
    } finally {
      setSending(false);
    }
  };

  return {
    router, customer, loading, statement, emails, subject, setSubject, message, setMessage, sending,
    activeField, setActiveField, input, setInput, add, remove, handleSend,
  };
};

export default useCustomerStatementEmail;
