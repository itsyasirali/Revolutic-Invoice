"use client";

import useSWR from "swr";
import { swrFetcher } from "@/lib/swr";
import type { CustomPlaceholderLike } from "@/lib/placeholders/registry";

export interface CustomPlaceholderRow extends CustomPlaceholderLike {
  id: number;
  label: string;
}

export const PLACEHOLDERS_KEY = "/placeholders";

export const useCustomPlaceholders = () => {
  const { data, isLoading, mutate } = useSWR<CustomPlaceholderRow[]>(
    PLACEHOLDERS_KEY,
    swrFetcher,
  );
  return { custom: data ?? [], isLoading, mutate };
};

export default useCustomPlaceholders;
