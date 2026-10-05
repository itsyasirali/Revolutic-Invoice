"use client";

import { useEffect } from "react";
import { useSWRConfig } from "swr";

/**
 * Puts server-rendered list data into the shared SWR cache (only if that key is
 * still empty), so a detail page opened from the list finds the list already
 * loaded instead of fetching it again.
 */
export const useSeedSwrCache = (key: string | null, data: unknown) => {
  const { cache, mutate } = useSWRConfig();
  useEffect(() => {
    if (key && data && cache.get(key)?.data === undefined) {
      mutate(key, data, { revalidate: false });
    }
    // Seed once per mount; later updates flow through SWR itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
};

export default useSeedSwrCache;
