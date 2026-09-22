"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, X, Plus, Check, Download } from "lucide-react";
import useInvoiceEmail from "@/hooks/invoices/useInvoiceEmail";
import { Button, PageHeader } from "@/components/ui";
import EmailContentFields from "@/components/ui/EmailContentFields";
import { useProfile } from "@/hooks/auth/useProfile";

const InvoiceEmailCompose: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user } = useProfile();

  const {
    invoice,
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
    updateMessage,
    updateSubject,
    toggleAttachPDF,
  } = useInvoiceEmail(id || "");

  if (loading) {
    return null;
  }

  if (!invoice && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader
        title="Compose Email"
        actions={
          <Button
            onClick={handleSend}
            disabled={sending}
            loading={sending}
            variant="primary"
            icon={<Send className="w-4 h-4" />}
          >
            {sending ? "Sending..." : "Send"}
          </Button>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="bg-white overflow-hidden">
          <div className="relative flex items-start px-6 py-4 border-b border-gray-100 min-h-[64px]">
            <span className="w-20 text-sm font-medium text-gray-500 pt-1.5">
              To
            </span>
            <div className="flex-1 flex flex-wrap gap-2 items-center">
              {emailData.to.map((email, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-md text-sm"
                >
                  <span className="text-sm text-gray-900">{email}</span>
                  <button
                    onClick={() => removeEmail("to", idx)}
                    className="hover:text-primary/70"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {activeField === "to" ? (
                <div className="flex items-center gap-2 min-w-[200px]">
                  <input
                    autoFocus
                    type="email"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "to")}
                    onBlur={() => !newEmailInput && setActiveField(null)}
                    placeholder="Enter email..."
                    className="flex-1 text-sm text-gray-500 outline-none bg-transparent placeholder:text-gray-600"
                  />
                  <button
                    onClick={() => handleAddEmail("to")}
                    className="p-1 hover:bg-gray-100 rounded-md text-primary"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : emailData.to.length < 3 ? (
                <button
                  onClick={() => setActiveField("to")}
                  className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-primary transition-colors"
                >
                  <Plus size={20} />
                </button>
              ) : null}
            </div>
          </div>

          <div className="relative flex items-start px-6 py-4 border-b border-gray-100 min-h-[64px]">
            <span className="w-20 text-sm font-medium text-gray-500 pt-1.5">
              Cc
            </span>
            <div className="flex-1 flex flex-wrap gap-2 items-center">
              {emailData.cc.map((email, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm"
                >
                  <span>{email}</span>
                  <button
                    onClick={() => removeEmail("cc", idx)}
                    className="hover:text-gray-900"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {activeField === "cc" ? (
                <div className="flex items-center gap-2 min-w-[200px]">
                  <input
                    autoFocus
                    type="email"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "cc")}
                    onBlur={() => !newEmailInput && setActiveField(null)}
                    placeholder="Enter email..."
                    className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
                  />
                  <button
                    onClick={() => handleAddEmail("cc")}
                    className="p-1 hover:bg-gray-100 rounded-md text-primary"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : emailData.cc.length < 3 ? (
                <button
                  onClick={() => setActiveField("cc")}
                  className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-primary transition-colors"
                >
                  <Plus size={20} />
                </button>
              ) : null}
            </div>
          </div>

          <div className="relative flex items-start px-6 py-4 border-b border-gray-100 min-h-[64px]">
            <span className="w-20 text-sm font-medium text-gray-500 pt-1.5">
              Bcc
            </span>
            <div className="flex-1 flex flex-wrap gap-2 items-center">
              {emailData.bcc.map((email, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm"
                >
                  <span>{email}</span>
                  <button
                    onClick={() => removeEmail("bcc", idx)}
                    className="hover:text-gray-900"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {activeField === "bcc" ? (
                <div className="flex items-center gap-2 min-w-[200px]">
                  <input
                    autoFocus
                    type="email"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "bcc")}
                    onBlur={() => !newEmailInput && setActiveField(null)}
                    placeholder="Enter email..."
                    className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
                  />
                  <button
                    onClick={() => handleAddEmail("bcc")}
                    className="p-1 hover:bg-gray-100 rounded-md text-primary"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : emailData.bcc.length < 3 ? (
                <button
                  onClick={() => setActiveField("bcc")}
                  className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-primary transition-colors"
                >
                  <Plus size={20} />
                </button>
              ) : null}
            </div>
          </div>

          <EmailContentFields
            scope="invoice"
            record={invoice}
            organizationName={user?.companyName}
            senderName={user?.name || user?.firstName}
            subject={emailData.subject}
            message={emailData.message}
            onSubjectChange={updateSubject}
            onMessageChange={updateMessage}
          />

          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <div
              onClick={toggleAttachPDF}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  emailData.attachPDF
                    ? "bg-primary border-primary"
                    : "bg-white border-gray-300 group-hover:border-primary"
                }`}
              >
                {emailData.attachPDF && (
                  <Check size={12} className="text-white" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">
                Attach Invoice PDF
              </span>
            </div>

            {emailData.attachPDF && (
              <div
                className="mt-5 flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg max-w-sm"
              >
                <div className="relative p-2 bg-red-50 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-red-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-bold px-1 rounded-sm tracking-widest uppercase">
                    PDF
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    Invoice-{invoice?.invoiceNumber || "Draft"}.pdf
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">PDF Document</p>
                </div>
                <button
                  type="button"
                  title="Download PDF"
                  onClick={() =>
                    router.push(`/invoices/preview/${invoice?.id || invoice?._id || id}?download=1`)
                  }
                  className="p-2 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  <Download size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEmailCompose;
