"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { Customer } from "@/types/customer";
import { getNavState } from "@/lib/clientNavState";

export const useCustomerDetails = () => {
  const params = useParams<{ id?: string }>();
  const id = params?.id;

  // Navigation state lives in the browser, so it can only be read after
  // mount; reading it during render made the server and client HTML differ
  // (hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const customer = useMemo(
    () =>
      mounted && id ? getNavState<Customer>(`customer:${id}`) : undefined,
    [id, mounted],
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
    loading: Boolean(id) && !mounted,
  };
};

export default useCustomerDetails;
