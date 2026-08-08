"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, X, Plus, Check, FileText, Download } from "lucide-react";
import usePaymentEmail from "@/hooks/payments/usePaymentEmail";
import { Button, LoadingSpinner, PageHeader } from "@/components/ui";

const PaymentEmailCompose: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const {
    payment,
    loading,
    sending,
    emailData,
    handleSend,
    removeEmail,
    updateMessage,
    toggleAttachPDF,
    newEmailInput,
    setNewEmailInput,
    activeField,
    setActiveField,
    handleAddEmail,
    handleKeyDown,
  } = usePaymentEmail(id || "");

  if (loading) {
    return (
      null
    );
  }

  if (!payment && !loading) {
    return (
      null
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader
        title="Compose Email"
        showBackButton={true}
        onBack={() => router.back()}
        actions={
          <Button
            onClick={handleSend}
            disabled={sending}
            variant="primary"
            icon={
              sending ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <Send className="w-4 h-4" />
              )
            }
          >
            {sending ? "Sending..." : "Send"}
          </Button>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="bg-white overflow-hidden">
          <div className="flex items-center px-6 py-4 border-b border-gray-100">
            <span className="w-20 text-sm font-medium text-gray-500">From</span>
            <span className="text-sm text-gray-900">{emailData.from}</span>
          </div>

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
              ) : (
                <button
                  onClick={() => setActiveField("to")}
                  className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-primary transition-colors"
                >
                  <Plus size={20} />
                </button>
              )}
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
              ) : (
                <button
                  onClick={() => setActiveField("cc")}
                  className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-primary transition-colors"
                >
                  <Plus size={20} />
                </button>
              )}
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
              ) : (
                <button
                  onClick={() => setActiveField("bcc")}
                  className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-primary transition-colors"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center px-6 py-4 border-b border-gray-100">
            <span className="w-20 text-sm font-medium text-gray-500">
              Subject
            </span>
            <input
              type="text"
              value={emailData.subject}
              readOnly
              className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
            />
          </div>

          <div className="px-6 py-4">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Message
            </label>
            <textarea
              value={emailData.message}
              onChange={(e) => updateMessage(e.target.value)}
              className="w-full h-64 p-4 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
              placeholder="Type your message here..."
            />
          </div>

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
                Attach Payment PDF
              </span>
            </div>

            {emailData.attachPDF && (
              <div 
                onClick={() => window.open(`/payments/preview/${payment?.id || id}`, '_blank')}
                className="mt-3 ml-8 flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg max-w-sm cursor-pointer hover:border-primary transition-colors group"
                title="Click to view/download PDF"
              >
                <div className="relative p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-bold px-1 rounded-sm tracking-widest uppercase">
                    PDF
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-gray-700 truncate group-hover:text-primary transition-colors">
                    Payment-{payment?.paymentNumber || "Draft"}.pdf
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">PDF Document</p>
                </div>
                <div className="p-2 text-gray-400 group-hover:text-primary transition-colors">
                  <Download size={18} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentEmailCompose;
