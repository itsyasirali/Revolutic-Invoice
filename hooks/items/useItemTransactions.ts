"use client";

import useSWR from "swr";
import { swrFetcher } from "@/lib/swr";

export interface ItemTransaction {
  key: string;
  type: "Invoice" | "Quote";
  id: number;
  number: string;
  date: string;
  status: string;
  currency: string;
  customer: string;
  quantity: number;
  rate: number;
  amount: number;
}

/** Invoices and quotes that use one item. */
export const useItemTransactions = (itemId: number) => {
  const { data, isLoading } = useSWR<{ transactions: ItemTransaction[] }>(
    `/items/${itemId}/transactions`,
    swrFetcher,
    { revalidateOnFocus: false },
  );
  return { rows: data?.transactions ?? [], isLoading };
};

export default useItemTransactions;
