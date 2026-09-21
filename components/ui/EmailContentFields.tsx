"use client";

import React, { useMemo, useRef, useState } from "react";
import PlaceholderPicker from "./PlaceholderPicker";
import useCustomPlaceholders from "@/hooks/common/useCustomPlaceholders";
import { buildPlaceholderValues } from "@/lib/placeholders/context";
import { replacePlaceholders } from "@/lib/placeholders/replace";
import type { PlaceholderScope } from "@/lib/placeholders/registry";

interface Props {
  scope: PlaceholderScope;
  record: any;
  organizationName?: string | null;
  senderName?: string | null;
  subject: string;
  message: string;
  onSubjectChange: (v: string) => void;
  onMessageChange: (v: string) => void;
}

const EmailContentFields: React.FC<Props> = ({
  scope,
  record,
  organizationName,
  senderName,
  subject,
  message,
  onSubjectChange,
  onMessageChange,
}) => {
  const { custom } = useCustomPlaceholders();
  const [preview, setPreview] = useState(false);
  const [target, setTarget] = useState<"subject" | "message">("message");
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const values = useMemo(
    () =>
      buildPlaceholderValues({
        scope,
        invoice: scope === "invoice" ? record : undefined,
        payment: scope === "payment" ? record : undefined,
        organizationName: organizationName ?? undefined,
        senderName: senderName ?? undefined,
        custom,
      }),
    [scope, record, organizationName, senderName, custom],
  );

  const insert = (token: string) => {
    const el = target === "subject" ? subjectRef.current : messageRef.current;
    const text = target === "subject" ? subject : message;
    const set = target === "subject" ? onSubjectChange : onMessageChange;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    set(text.slice(0, start) + token + text.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  return (
    <>
      <div className="flex items-center px-6 py-4 border-b border-gray-100">
        <span className="w-20 text-sm font-medium text-gray-500">Subject</span>
        {preview ? (
          <div className="flex-1 text-sm text-gray-900">
            {replacePlaceholders(subject, values)}
          </div>
        ) : (
          <input
            ref={subjectRef}
            type="text"
            value={subject}
            onFocus={() => setTarget("subject")}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
          />
        )}
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2 gap-2">
          <label className="text-sm font-medium text-gray-500">Message</label>
          <div className="flex items-center gap-2">
            {!preview && (
              <PlaceholderPicker scope={scope} custom={custom} onInsert={insert} />
            )}
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className="text-xs px-2 py-1 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
        </div>
        {preview ? (
          <div className="w-full h-64 p-4 overflow-auto text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-wrap">
            {replacePlaceholders(message, values)}
          </div>
        ) : (
          <textarea
            ref={messageRef}
            value={message}
            onFocus={() => setTarget("message")}
            onChange={(e) => onMessageChange(e.target.value)}
            className="w-full h-64 p-4 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
            placeholder="Type your message here..."
          />
        )}
      </div>
    </>
  );
};

export default EmailContentFields;
