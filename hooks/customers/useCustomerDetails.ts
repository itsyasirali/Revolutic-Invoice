"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import type { Customer } from "@/types/customer";
import { getNavState } from "@/lib/clientNavState";
import { swrFetcher } from "@/lib/swr";

export const useCustomerDetails = () => {
  const params = useParams<{ id?: string }>();
  const id = params?.id;

  // Navigation state lives in the browser, so it can only be read after
  // mount; reading it during render made the server and client HTML differ
  // (hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const navCustomer = useMemo(
    () =>
      mounted && id ? getNavState<Customer>(`customer:${id}`) : undefined,
    [id, mounted],
  );

  // The list no longer embeds every invoice and payment, so the detail page
  // loads its own customer's records. The list row (nav state) shows instantly.
  const { data } = useSWR<{ customer: Customer }>(
    mounted && id ? `/customers/${id}` : null,
    swrFetcher,
    { revalidateOnFocus: false, dedupingInterval: 15000 },
  );

  const customer = useMemo<Customer | undefined>(
    () =>
      data?.customer
        ? { ...navCustomer, ...data.customer }
        : navCustomer,
    [data, navCustomer],
  );

  const primaryContact = useMemo(() => {
    const contact = customer?.contacts?.[0];
    return {
      name: contact
        ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "—"
        : "—",
      email: contact?.email || "—",
      phone: contact?.contact || "—",
    };
  }, [customer]);

  return {
    customer,
    primaryContact,
    loading: Boolean(id) && !customer,
  };
};

export default useCustomerDetails;
