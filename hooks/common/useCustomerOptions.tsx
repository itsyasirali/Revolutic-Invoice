"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { swrFetcher, SWR_KEYS } from "@/lib/swr";
import { customerLabel } from "@/lib/format";
import CustomerAvatar from "@/components/ui/CustomerAvatar";

interface CustomerRecord {
  id: number;
  displayName?: string;
  companyName?: string;
  currency?: string;
  status?: string;
  contacts?: { email?: string }[];
}

/** Active customers as Select options (reuses the cached /customers request). */
const useCustomerOptions = () => {
  const { data, isLoading } = useSWR<{ customers?: CustomerRecord[] } | CustomerRecord[]>(
    SWR_KEYS.customers,
    swrFetcher,
    { revalidateOnFocus: false },
  );

  const customers: CustomerRecord[] = useMemo(
    () => (Array.isArray(data) ? data : data?.customers || []),
    [data],
  );

  const options = useMemo(
    () =>
      customers
        .filter((c) => (c.status || "Active").toLowerCase() !== "inactive")
        .map((c) => {
          const label = customerLabel(c) || `Customer ${c.id}`;
          return {
            label,
            value: String(c.id),
            description: c.contacts?.[0]?.email || undefined,
            avatar: <CustomerAvatar name={label} />,
          };
        }),
    [customers],
  );

  return { customers, options, loading: isLoading };
};

export default useCustomerOptions;
