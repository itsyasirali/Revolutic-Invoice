"use client";

import useSWR from "swr";
import { swrFetcher, SWR_KEYS } from "@/lib/swr";
import type { Item } from "@/types/item";

type ItemsApiResponse = {
  items?: Item[];
};

const useItemsData = (initialItems?: Item[]) => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    ItemsApiResponse | Item[]
  >(SWR_KEYS.items, swrFetcher, {
    fallbackData: initialItems ? { items: initialItems } : undefined,
    revalidateOnFocus: false,
    // Server data paints instantly; always refetch on mount so edits made
    // elsewhere (cached RSC payload / SWR cache) never show stale.
    revalidateOnMount: true,
    dedupingInterval: 2000,
  });

  const items: Item[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : initialItems || [];

  const errorMessage = error
    ? error?.response?.data?.message || error?.message || "Failed to fetch items"
    : null;

  return {
    items,
    loading: isLoading,
    isValidating,
    error: errorMessage,
    refetch: () => mutate(),
  };
};

export default useItemsData;
