"use client";

import React, { useState } from "react";
import useSWR from "swr";
import axios from "@/lib/axios";
import { swrFetcher } from "@/lib/swr";
import { Button, Checkbox, Textarea, toast } from "@/components/ui";
import type { PortalComment } from "@/types/portal";

/** Customer-portal conversation on a record, with replies from the business. */
const BusinessPortalComments: React.FC<{ entityType: "invoice" | "quote" | "project"; entityId: number }> = ({
  entityType,
  entityId,
}) => {
  const key = `/portal-admin/comments?entityType=${entityType}&entityId=${entityId}`;
  const { data, mutate } = useSWR<{ comments: PortalComment[] }>(key, swrFetcher, {
    revalidateOnFocus: false,
  });
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(true);
  const [busy, setBusy] = useState(false);
  const comments = data?.comments || [];

  const send = async () => {
    if (!message.trim()) return;
    setBusy(true);
    try {
      await axios.post("/portal-admin/comments", {
        entityType,
        entityId,
        message,
        visibleToCustomer: visible,
      });
      setMessage("");
      await mutate();
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Failed to add comment", "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Customer Comments</h2>
        <p className="text-xs text-slate-500 mt-0.5">Conversation with the customer through the portal.</p>
      </div>
      {comments.length === 0 ? (
        <p className="text-sm text-slate-500">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className={`rounded-lg px-4 py-3 text-sm ${c.authorType === "customer" ? "bg-primary/5" : "bg-slate-100"}`}
            >
              <p className="text-xs text-slate-500 mb-1">
                <span className="font-semibold text-slate-700">
                  {c.authorType === "customer" ? c.authorName || "Customer" : "You"}
                </span>{" "}
                · {new Date(c.createdAt).toLocaleString()}
                {c.authorType === "business" && c.visibleToCustomer === false && " · Internal note"}
              </p>
              <p className="whitespace-pre-wrap text-slate-800">{c.message}</p>
            </li>
          ))}
        </ul>
      )}
      <Textarea
        label="Reply"
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write a reply..."
        fullWidth
      />
      <div className="flex items-center justify-between gap-3">
        <Checkbox
          label="Visible to customer"
          checked={visible}
          onChange={(e) => setVisible(e.target.checked)}
        />
        <Button variant="primary" size="sm" onClick={send} loading={busy} disabled={busy || !message.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default BusinessPortalComments;
