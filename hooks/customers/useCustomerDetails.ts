"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import type { Customer } from "@/types/customer";
import { getNavState } from "@/lib/clientNavState";

export const useCustomerDetails = () => {
  const params = useParams<{ id?: string }>();
  const id = params?.id;

  const customer = useMemo(
    () => (id ? getNavState<Customer>(`customer:${id}`) : undefined),
    [id],
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
    loading: false,
  };
};

export default useCustomerDetails;
