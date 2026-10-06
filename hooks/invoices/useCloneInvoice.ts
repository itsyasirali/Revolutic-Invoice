"use client";

import { useCallback } from "react";
import { setNavState } from "@/lib/clientNavState";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";

/** Opens the new-invoice form pre-filled from an existing invoice; nothing is saved until the user saves. */
const useCloneInvoice = () => {
  const router = useRouter();

  const cloneInvoice = useCallback(
    (invoice: unknown) => {
      if (!invoice) return;
      setNavState("invoice:clone", invoice);
      router.push("/invoices/new");
    },
    [router],
  );

  return { cloneInvoice, cloning: false };
};

export default useCloneInvoice;
