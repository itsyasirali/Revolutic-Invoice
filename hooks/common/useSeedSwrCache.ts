"use client";

import { useEffect } from "react";
import { useSWRConfig } from "swr";

/**
 * Puts the list data the server just rendered into the shared SWR cache, so
 * (a) a detail page opened from the list finds the list already loaded, and
 * (b) the list is never stale: changes made elsewhere (a payment created and
 * sent, an invoice edited...) only invalidate lists that are mounted, so a list
 * left cached would otherwise keep showing the old data when you come back.
 * Runs again whenever the server hands the page a new list (e.g. after
 * router.refresh()).
 */
export const useSeedSwrCache = (key: string | null, data: unknown) => {
  const { mutate } = useSWRConfig();
  // `data` is usually a fresh wrapper object each render ({ payments: [...] });
  // the list inside it keeps its identity until the server sends a new one.
  const marker = data && typeof data === "object" ? Object.values(data as object)[0] : data;

  useEffect(() => {
    if (key && data) mutate(key, data, { revalidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, marker]);
};

export default useSeedSwrCache;
