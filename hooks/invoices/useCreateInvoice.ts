"use client";

import { useState, useCallback } from "react";
import axios from "@/lib/axios";
import { invalidateInvoices } from "@/lib/swr";
import { toast } from "@/components/ui";

export type CreateInvoicePayload = any;
type CreateResp = any;

const useCreateInvoice = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<CreateResp | null>(null);

  const request = useCallback(
    async (payload: CreateInvoicePayload, sendNow: boolean) => {
      setError(null);
      setLoading(true);
      try {
        const res = await axios.post<CreateResp>(`/invoices`, {
          ...payload,
          sendNow,
        });
        setLast(res.data);
        await invalidateInvoices();
        if (sendNow) {
          toast.success(
            "Invoice created and sent successfully",
            "Invoice Sent"
          );
        } else {
          toast.success(
            "Invoice draft saved successfully",
            "Draft Saved"
          );
        }
        return res.data;
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Failed to create invoice";
        setError(msg);
        toast.error(msg, "Error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const saveDraft = useCallback(
    async (payload: CreateInvoicePayload) => request(payload, false),
    [request]
  );

  const saveAndSend = useCallback(
    async (payload: CreateInvoicePayload) => request(payload, true),
    [request]
  );

  return { saveDraft, saveAndSend, loading, error, last };
};

export default useCreateInvoice;
