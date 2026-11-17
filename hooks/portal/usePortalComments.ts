"use client";

import { useState } from "react";
import type React from "react";
import useSWR from "swr";
import axios from "@/lib/axios";
import { swrFetcher } from "@/lib/swr";
import { toast } from "@/components/ui";
import { usePortalQuery, portalSend, errorText } from "@/lib/portalApi";
import type { PortalComment } from "@/types/portal";

type EntityType = "invoice" | "quote" | "project";

/** Business-side thread on an invoice, quote or project (conversation with the customer). */
export const useBusinessPortalComments = (entityType: EntityType, entityId: number) => {
  const key = `/portal-admin/comments?entityType=${entityType}&entityId=${entityId}`;
  const { data, mutate } = useSWR<{ comments: PortalComment[] }>(key, swrFetcher, {
    revalidateOnFocus: false,
  });
  const [visible, setVisible] = useState(true);
  const [busy, setBusy] = useState(false);
  const comments = data?.comments || [];

  /** Returns true when the comment was posted. */
  const post = async (html: string): Promise<boolean> => {
    setBusy(true);
    try {
      await axios.post("/portal-admin/comments", {
        entityType,
        entityId,
        message: html,
        visibleToCustomer: visible,
      });
      await mutate();
      return true;
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Failed to add comment", "Error");
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { comments, visible, setVisible, busy, post };
};

/** Customer-side conversation thread on an invoice, quote or project. */
export const usePortalCommentThread = (entityType: EntityType, entityId: number) => {
  const { data, refresh } = usePortalQuery<{ comments: PortalComment[]; canComment: boolean }>(
    `/comments?entityType=${entityType}&entityId=${entityId}`,
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setBusy(true);
    setError("");
    try {
      await portalSend("POST", "/comments", { entityType, entityId, message });
      setMessage("");
      await refresh();
    } catch (err) {
      setError(errorText(err, "Failed to send comment"));
    } finally {
      setBusy(false);
    }
  };

  return { data, message, setMessage, error, busy, send };
};
