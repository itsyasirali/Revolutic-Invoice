"use client";

import useSWR from "swr";
import axios from "@/lib/axios";
import { swrFetcher, SWR_KEYS, invalidateQuotes, invalidateQuotesAndInvoices } from "@/lib/swr";
import { toast } from "@/components/ui";
import type { Quote } from "@/types/quote";

/** Single quote (detail / edit / preview / email pages). */
export const useQuote = (id?: string) => {
  const { data, error, isLoading, mutate } = useSWR<{ quote: Quote }>(
    id ? `${SWR_KEYS.quotes}/${id}` : null,
    swrFetcher,
    { revalidateOnFocus: true },
  );
  return {
    quote: data?.quote ?? null,
    loading: isLoading,
    notFound: !!error && !data,
    refetch: () => mutate(),
  };
};

const errorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;

export type QuoteAction = "accept" | "decline" | "viewed" | "clone" | "convert";

const SUCCESS: Record<QuoteAction, [string, string]> = {
  accept: ["Quote marked as accepted", "Quote Accepted"],
  decline: ["Quote marked as declined", "Quote Declined"],
  viewed: ["Quote marked as viewed", "Quote Viewed"],
  clone: ["Quote cloned as a new draft", "Quote Cloned"],
  convert: ["Quote converted to a draft invoice", "Invoice Created"],
};

/**
 * Runs a server-side quote action. All transitions/validation live on the
 * server; this only reports the outcome. Returns the response data or null.
 */
export const runQuoteAction = async (id: number | string, action: QuoteAction) => {
  try {
    const res = await axios.post(`/quotes/${id}/${action}`);
    await (action === "convert" ? invalidateQuotesAndInvoices() : invalidateQuotes());
    toast.success(SUCCESS[action][0], SUCCESS[action][1]);
    return res.data as { quote?: Quote; invoice?: { id: number } };
  } catch (err) {
    toast.error(errorMessage(err, `Failed to ${action} quote`), "Error");
    return null;
  }
};

export default useQuote;
