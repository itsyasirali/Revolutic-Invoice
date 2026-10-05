"use client";

import useSWR from "swr";
import { swrFetcher } from "@/lib/swr";

/**
 * One record for a detail page, taken from the list that is already loaded
 * (same SWR cache as the list screen) so opening it makes no request of its own.
 * Only when the record isn't in the loaded list (e.g. created a moment ago in
 * another tab) does it fall back to fetching that single record.
 */
export const useRecordFromList = <T extends { id: number | string }>({
  id,
  listKey,
  collection,
  singleField,
}: {
  id?: string;
  listKey: string;
  /** Property the list API wraps the array in, e.g. "expenses". */
  collection: string;
  /** Property the single-record API wraps the record in, e.g. "expense". */
  singleField: string;
}) => {
  const list = useSWR<Record<string, T[]>>(listKey, swrFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 15000,
  });
  const fromList = id ? (list.data?.[collection] ?? []).find((r) => String(r.id) === String(id)) ?? null : null;

  const single = useSWR<Record<string, T>>(
    id && !fromList && list.data ? `${listKey}/${id}` : null,
    swrFetcher,
    { revalidateOnFocus: false },
  );
  const record = fromList ?? single.data?.[singleField] ?? null;

  return {
    record,
    loading: !record && (list.isLoading || single.isLoading),
    notFound: !record && !!list.data && !!single.error,
    refetch: async () => {
      await list.mutate();
    },
  };
};

export default useRecordFromList;
