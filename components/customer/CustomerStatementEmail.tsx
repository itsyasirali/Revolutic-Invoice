"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send, X, Plus, Check, Download } from "lucide-react";
import { Button, PageHeader, toast } from "@/components/ui";
import useCustomerDetailsView from "@/hooks/customers/useCustomerDetailsView";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import { useCustomerStatement, StatementRangePicker, type StatementRange } from "./CustomerStatement";

type Field = "to" | "cc" | "bcc";
const MAX_PER_FIELD = 3;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

const CustomerStatementEmail: React.FC = () => {
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

  const [emails, setEmails] = useState<Record<Field, string[]>>({ to: [], cc: [], bcc: [] });
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [activeField, setActiveField] = useState<Field | null>(null);
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

  if (loading || !customer) return null;

  const add = (type: Field) => {
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

  const remove = (type: Field, idx: number) =>
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
      router.push(`/customers/${customer.id}`);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to send email", "Send Failed");
    } finally {
      setSending(false);
    }
  };

  const row = (label: string, type: Field, chip: string) => (
    <div className="relative flex items-start px-6 py-4 border-b border-gray-100 min-h-[64px]">
      <span className="w-20 text-sm font-medium text-gray-500 pt-1.5">{label}</span>
      <div className="flex-1 flex flex-wrap gap-2 items-center">
        {emails[type].map((email, idx) => (
          <div key={idx} className={`flex items-center gap-1 ${chip} px-3 py-1 rounded-md text-sm`}>
            <span>{email}</span>
            <button onClick={() => remove(type, idx)} className="hover:opacity-70">
              <X size={14} />
            </button>
          </div>
        ))}
        {activeField === type ? (
          <div className="flex items-center gap-2 min-w-[200px]">
            <input
              autoFocus
              type="email"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add(type);
                }
              }}
              onBlur={() => !input && setActiveField(null)}
              placeholder="Enter email..."
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
            />
            <button onClick={() => add(type)} className="p-1 hover:bg-gray-100 rounded-md text-primary">
              <Check size={16} />
            </button>
          </div>
        ) : emails[type].length < MAX_PER_FIELD ? (
          <button
            onClick={() => {
              setInput("");
              setActiveField(type);
            }}
            className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-primary transition-colors"
          >
            <Plus size={20} />
          </button>
        ) : null}
      </div>
    </div>
  );

  const fileName = `Statement - ${customer.displayName || customer.companyName || "Customer"}.pdf`;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader
        title="Compose Email"
        showBackButton={true}
        onBack={() => router.back()}
        actions={
          <div className="flex items-center gap-2">
            <StatementRangePicker
              range={statement.range}
              from={statement.from}
              to={statement.to}
              onRange={statement.setRange}
              onFrom={statement.setFrom}
              onTo={statement.setTo}
            />
          <Button
            onClick={handleSend}
            disabled={sending}
            loading={sending}
            variant="primary"
            icon={<Send className="w-4 h-4" />}
          >
            {sending ? "Sending..." : "Send"}
          </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="bg-white overflow-hidden">
          {row("To", "to", "bg-primary/10 text-primary")}
          {row("Cc", "cc", "bg-gray-100 text-gray-700")}
          {row("Bcc", "bcc", "bg-gray-100 text-gray-700")}

          <div className="flex items-center px-6 py-4 border-b border-gray-100 min-h-[64px]">
            <span className="w-20 text-sm font-medium text-gray-500">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="flex-1 text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-start px-6 py-4 border-b border-gray-100">
            <span className="w-20 text-sm font-medium text-gray-500 pt-1.5">Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              placeholder="Write your message..."
              className="flex-1 resize-y text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-400"
            />
          </div>

          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg max-w-sm">
              <div className="relative p-2 bg-red-50 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-bold px-1 rounded-sm tracking-widest uppercase">
                  PDF
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-gray-700 truncate">{fileName}</p>
                <p className="text-xs text-gray-400 mt-0.5">PDF Document</p>
              </div>
              <button
                type="button"
                onClick={statement.handleDownload}
                disabled={statement.downloading}
                title="Download PDF"
                className="p-2 text-gray-400 hover:text-primary transition-colors"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerStatementEmail;
