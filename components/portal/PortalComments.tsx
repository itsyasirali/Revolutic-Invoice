"use client";

import React from "react";
import { usePortalCommentThread } from "@/hooks/portal/usePortalComments";
import { PCard, ErrorNote, fieldClass, primaryBtn } from "./PortalUI";
import CommentBody from "./CommentBody";

/** Customer-side conversation thread on an invoice, quote or project. */
const PortalComments: React.FC<{ entityType: "invoice" | "quote" | "project"; entityId: number }> = ({
  entityType,
  entityId,
}) => {
  const { data, message, setMessage, error, busy, send } = usePortalCommentThread(entityType, entityId);

  return (
    <PCard title="Comments" className="print:hidden">
      {data && data.comments.length === 0 && (
        <p className="text-[14px] text-slate-500 mb-4">No comments yet.</p>
      )}
      <ul className="space-y-3 mb-4">
        {(data?.comments || []).map((c) => (
          <li
            key={c.id}
            className={`rounded-lg px-4 py-3 text-[14px] leading-5 ${
              c.authorType === "customer" ? "bg-primary/5" : "bg-slate-100"
            }`}
          >
            <p className="text-[12px] text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">
                {c.authorType === "customer" ? "You" : c.authorName || "Business"}
              </span>{" "}
              · {new Date(c.createdAt).toLocaleString()}
            </p>
            <CommentBody message={c.message} className="text-slate-800" />
          </li>
        ))}
      </ul>
      {error && <ErrorNote message={error} />}
      {data?.canComment !== false && (
        <form onSubmit={send} className="flex flex-col sm:flex-row gap-2 mt-2">
          <input
            className={fieldClass}
            placeholder="Write a comment..."
            value={message}
            maxLength={2000}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" disabled={busy || !message.trim()} className={`${primaryBtn} sm:w-28`}>
            Send
          </button>
        </form>
      )}
    </PCard>
  );
};

export default PortalComments;
