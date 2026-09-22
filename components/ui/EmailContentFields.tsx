"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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

const HAS_TOKEN = /%[A-Za-z]/;

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

  // The default template starts out with raw %Placeholder% tokens (and the
  // parent hook may populate subject/message a render or two after `record`
  // becomes available). Resolve them into real values whenever a token is
  // still present, so the fields only ever display the actual output. This
  // is idempotent: once resolved, the text no longer matches HAS_TOKEN.
  useEffect(() => {
    if (!record) return;
    if (HAS_TOKEN.test(subject)) {
      onSubjectChange(replacePlaceholders(subject, values));
    }
    if (HAS_TOKEN.test(message)) {
      onMessageChange(replacePlaceholders(message, values));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record, values, subject, message]);

  return (
    <>
      <div className="flex items-center px-6 py-4 border-b border-gray-100">
        <span className="w-20 text-sm font-medium text-gray-500">Subject</span>
        <input
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
        />
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2 gap-2">
          <label className="text-sm font-medium text-gray-500">Message</label>
        </div>
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          className="w-full h-64 p-4 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-primary transition-all resize-none"
          placeholder="Type your message here..."
        />
      </div>
    </>
  );
};

export default EmailContentFields;
