"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Send, X, Plus, Check, Download } from "lucide-react";
import { Button, PageHeader } from "@/components/ui";
import EmailContentFields from "@/components/ui/EmailContentFields";
import { useProfile } from "@/hooks/auth/useProfile";
import useQuoteEmail from "@/hooks/quotes/useQuoteEmail";

type Field = "to" | "cc" | "bcc";

const QuoteEmailCompose: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { user } = useProfile();
  const email = useQuoteEmail(id || "");
  const { emailData, activeField } = email;

  if (email.loading || !email.quote) return null;

  const row = (label: string, type: Field, chip: string) => (
    <div className="relative flex items-start px-6 py-4 border-b border-gray-100 min-h-[64px]">
      <span className="w-20 text-sm font-medium text-gray-500 pt-1.5">{label}</span>
      <div className="flex-1 flex flex-wrap gap-2 items-center">
        {emailData[type].map((address, idx) => (
          <div key={address} className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${chip}`}>
            <span>{address}</span>
            <button type="button" onClick={() => email.removeEmail(type, idx)} className="hover:opacity-70">
              <X size={14} />
            </button>
          </div>
        ))}
        {activeField === type ? (
          <div className="flex items-center gap-2 min-w-[200px]">
            <input
              autoFocus
              type="email"
              value={email.newEmailInput}
              onChange={(e) => email.setNewEmailInput(e.target.value)}
              onKeyDown={(e) => email.handleKeyDown(e, type)}
              onBlur={() => !email.newEmailInput && email.setActiveField(null)}
              placeholder="Enter email..."
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => email.handleAddEmail(type)}
              className="p-1 hover:bg-gray-100 rounded-md text-primary"
            >
              <Check size={16} />
            </button>
          </div>
        ) : emailData[type].length < 3 ? (
          <button
            type="button"
            onClick={() => email.setActiveField(type)}
            className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-primary transition-colors"
          >
            <Plus size={20} />
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader
        title="Compose Email"
        onBack={() => email.router.push(`/quotes/${id}`)}
        actions={
          <Button
            onClick={email.handleSend}
            disabled={email.sending}
            loading={email.sending}
            variant="primary"
            icon={<Send className="w-4 h-4" />}
          >
            {email.sending ? "Sending..." : "Send"}
          </Button>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="bg-white overflow-hidden">
          {row("To", "to", "bg-primary/10 text-primary")}
          {row("Cc", "cc", "bg-gray-100 text-gray-700")}
          {row("Bcc", "bcc", "bg-gray-100 text-gray-700")}

          <EmailContentFields
            scope="invoice"
            record={email.placeholderRecord}
            organizationName={user?.companyName}
            senderName={user?.name || user?.firstName}
            subject={emailData.subject}
            message={emailData.message}
            onSubjectChange={email.updateSubject}
            onMessageChange={email.updateMessage}
          />

          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <div
              onClick={email.toggleAttachPDF}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  emailData.attachPDF
                    ? "bg-primary border-primary"
                    : "bg-white border-gray-300 group-hover:border-primary"
                }`}
              >
                {emailData.attachPDF && <Check size={12} className="text-white" />}
              </div>
              <span className="text-sm font-medium text-gray-700">Attach Quote PDF</span>
            </div>

            {emailData.attachPDF && (
              <div className="mt-5 flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg max-w-sm">
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    Quote-{email.quote.quoteNumber}.pdf
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">PDF Document</p>
                </div>
                <button
                  type="button"
                  title="Download PDF"
                  onClick={() => email.router.push(`/quotes/preview/${email.quote?.id}?download=1`)}
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

export default QuoteEmailCompose;
