"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { usePortalQuery, portalSend, errorText } from "@/lib/portalApi";
import { getNavState } from "@/lib/clientNavState";
import type { InvoiceRow, QuoteRow } from "@/components/portal/PortalDocuments";

export const useRouteId = () => useParams<{ id?: string }>()?.id;

/** Navigation state is stored in the browser, so it is only readable after mount. */
export const useNavRecord = <T,>(key: string | null): T | undefined => {
  const [record, setRecord] = useState<T>();
  useEffect(() => {
    setRecord(key ? getNavState<T>(key) : undefined);
  }, [key]);
  return record;
};

export const usePortalInvoiceList = () => {
  const { data, error, loading } = usePortalQuery<{ invoices: InvoiceRow[] }>("/invoices");
  const [status, setStatus] = useState("All");
  const rows = useMemo(
    () => (data?.invoices || []).filter((i) => status === "All" || i.status === status),
    [data, status],
  );
  return { data, error, loading, status, setStatus, rows };
};

export const usePortalQuoteList = () => {
  const { data, error, loading } = usePortalQuery<{ quotes: QuoteRow[] }>("/quotes");
  const [status, setStatus] = useState("All");
  const rows = useMemo(
    () => (data?.quotes || []).filter((q) => status === "All" || q.status === status),
    [data, status],
  );
  return { data, error, loading, status, setStatus, rows };
};

/** Accept or decline a quote from the portal, then refresh it. */
export const usePortalQuoteResponse = (refresh: () => Promise<unknown> | void) => {
  const [busy, setBusy] = useState<"" | "accept" | "decline">("");
  const [actionError, setActionError] = useState("");

  const respond = async (quoteId: number, action: "accept" | "decline") => {
    setBusy(action);
    setActionError("");
    try {
      await portalSend("POST", `/quotes/${quoteId}/${action}`);
      await refresh();
    } catch (err) {
      setActionError(errorText(err, "Failed to update quote"));
    } finally {
      setBusy("");
    }
  };

  return { busy, actionError, respond };
};
