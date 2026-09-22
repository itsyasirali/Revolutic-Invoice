"use client";

import { useState, useCallback } from "react";
import axios from "@/lib/axios";
import { invalidateInvoices } from "@/lib/swr";
import { toast } from "@/components/ui";

type WriteOffTarget = {
  id: number | string;
  invoice: string;
  amount: number;
} | null;

const useWriteOffInvoice = (refetch?: () => void) => {
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState<WriteOffTarget>(null);

  const openWriteOff = useCallback(
    (invoice: { id: number | string; invoice: string; amount: number }) => {
      setTarget(invoice);
    },
    [],
  );

  const closeWriteOff = useCallback(() => setTarget(null), []);

  const submitWriteOff = useCallback(
    async (amount: number, reason: string) => {
      if (!target) return;
      setLoading(true);
      try {
        await axios.post(`/invoices/${target.id}/write-off`, {
          amount,
          reason,
        });
        toast.success("Invoice written off successfully", "Written Off");
        await invalidateInvoices();
        refetch?.();
        setTarget(null);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err.message ||
          "Failed to write off invoice";
        toast.error(msg, "Write-off Failed");
      } finally {
        setLoading(false);
      }
    },
    [target, refetch],
  );

  const reverseWriteOff = useCallback(
    async (invoiceId: number | string) => {
      setLoading(true);
      try {
        await axios.post(`/invoices/${invoiceId}/write-off/reverse`);
        toast.success("Write-off reversed successfully", "Reversed");
        await invalidateInvoices();
        refetch?.();
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err.message ||
          "Failed to reverse write-off";
        toast.error(msg, "Reverse Failed");
      } finally {
        setLoading(false);
      }
    },
    [refetch],
  );

  return {
    target,
    loading,
    openWriteOff,
    closeWriteOff,
    submitWriteOff,
    reverseWriteOff,
  };
};

export default useWriteOffInvoice;
