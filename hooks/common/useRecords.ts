"use client";

import useSWR from "swr";
import { swrFetcher } from "@/lib/swr";

/**
 * Generic SWR collection loader shared by the Expenses / Time Tracking /
 * Quotes lists. `collectionKey` is the property the API wraps the array in.
 */
const useRecords = <T,>(
  swrKey: string,
  collectionKey: string,
  initial?: T[],
) => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    Record<string, T[]> | T[]
  >(swrKey, swrFetcher, {
    fallbackData: initial ? { [collectionKey]: initial } : undefined,
    revalidateOnFocus: true,
    revalidateOnMount: true,
  });

  const records: T[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.[collectionKey])
      ? (data?.[collectionKey] as T[])
      : initial || [];

  const errorMessage = error
    ? error?.response?.data?.message || error?.message || "Failed to load data"
    : null;

  return {
    records,
    loading: isLoading,
    isValidating,
    error: errorMessage,
    refetch: () => mutate(),
  };
};

export default useRecords;
