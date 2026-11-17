"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { toast } from "@/components/ui";
import { useOrgRouter } from "@/hooks/organization/useOrgRouter";

interface Options {
  endpoint: string;
  bodyKey: string;
  invalidate: () => Promise<unknown> | void;
  successMessage: string;
}

/** Turns one record (expense, time entry, ...) into an invoice, then opens the invoice. */
export const useConvertToInvoice = ({ endpoint, bodyKey, invalidate, successMessage }: Options) => {
  const router = useOrgRouter();
  const [converting, setConverting] = useState(false);

  const convert = async (recordId: number, refetch: () => Promise<unknown> | void) => {
    setConverting(true);
    try {
      const res = await axios.post(endpoint, { [bodyKey]: [recordId] });
      await invalidate();
      await refetch();
      toast.success(successMessage, "Invoice Created");
      router.push(`/invoices/${res.data.invoice.id}`);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Failed to create invoice", "Error");
    } finally {
      setConverting(false);
    }
  };

  return { converting, convert };
};

export default useConvertToInvoice;
