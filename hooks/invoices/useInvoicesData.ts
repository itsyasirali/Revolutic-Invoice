"use client";

import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { swrFetcher, SWR_KEYS } from "@/lib/swr";

type RawDoc = any;

export type UIInvoiceListItem = {
  id: number;
  invoice: string;
  name: string;
  email: string;
  currency?: string;
  date: string;
  dueDate?: string;
  amount: string;
  status: {
    tooltip: string;
    color: "success" | "danger" | "warning" | "info" | "gray" | "default";
  };
  overdueDays?: number;
  documents?: any[];
  raw: RawDoc;
};

export type CustomerFinancials = {
  customerKey: string;
  remaining: number;
  received: number;
};

function toStatus(s: any): UIInvoiceListItem["status"] {
  const v = String(s ?? "").toLowerCase();
  if (v === "sent") return { tooltip: "Sent", color: "info" };
  if (v === "draft") return { tooltip: "Draft", color: "gray" };
  if (v === "overdue") return { tooltip: "Overdue", color: "danger" };
  if (v === "partially paid" || v === "partial") return { tooltip: "Partially Paid", color: "warning" };
  if (v === "paid") return { tooltip: "Paid", color: "success" };
  return { tooltip: s || "Draft", color: "gray" };
}


function computeOverdueDays(due: any): number | undefined {
  if (!due) return undefined;
  const dueDate = new Date(due);
  const now = new Date();
  const diffMs = now.getTime() - dueDate.getTime();
  if (diffMs <= 0) return undefined;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function mapDoc(d: RawDoc): UIInvoiceListItem {
  const id = Number(d?.id ?? 0);
  const invNum = d?.invoiceNumber ?? d?.invoice ?? "—";

  // Handle both customerDisplayName and displayName from populated customerId
  const nm =
    d?.customerDisplayName ??
    d?.customerId?.displayName ??
    d?.customer?.displayName ??
    d?.name ??
    "";
  // Get email from first contact in customer's contacts array
  const em =
    d?.customerId?.contacts?.[0]?.email ??
    d?.customer?.contacts?.[0]?.email ??
    "";

  const when = d?.dueDate ?? d?.invoiceDate ?? d?.date ?? "";
  const date = when ? new Date(when).toLocaleDateString() : "";
  const dueDateStr = d?.dueDate ? new Date(d.dueDate).toLocaleDateString() : "";
  const amount = String(d?.total ?? d?.amount ?? "0");
  const isOverdue = String(d?.status ?? "").toLowerCase() === "overdue";
  const overdueDays = isOverdue ? computeOverdueDays(d?.dueDate) : undefined;

  return {
    id,
    invoice: invNum,
    name: nm,
    email: em,
    date,
    dueDate: dueDateStr,
    amount,
    currency: d?.currency ?? "PKR",
    status: toStatus(d?.status),
    overdueDays,
    documents: d?.documents ?? [],
    raw: d,
  };
}

type ListFilters = {
  status?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
};

export default function useInvoicesList(
  filters: ListFilters = {},
  initialInvoices?: any[],
) {
  const qs = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.customerId) params.set("customerId", filters.customerId);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    const str = params.toString();
    return str ? `?${str}` : "";
  }, [filters.status, filters.customerId, filters.startDate, filters.endDate]);

  const swrKey = `${SWR_KEYS.invoices}${qs}`;

  const {
    data,
    error: swrError,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(swrKey, swrFetcher, {
    fallbackData: initialInvoices
      ? Array.isArray(initialInvoices)
        ? initialInvoices
        : { invoices: initialInvoices }
      : undefined,
    revalidateOnFocus: true,
    revalidateOnMount: true,
  });

  const rawInvoices: RawDoc[] = useMemo(() => {
    if (!data) return initialInvoices || [];
    return Array.isArray(data)
      ? data
      : (data as any)?.invoices ?? initialInvoices ?? [];
  }, [data, initialInvoices]);

  const items: UIInvoiceListItem[] = useMemo(() => {
    return rawInvoices.map(mapDoc);
  }, [rawInvoices]);

  const customerFinancials = useMemo(() => {
    const map = new Map<string, CustomerFinancials>();

    rawInvoices.forEach((invoice) => {
      const customerName =
        invoice?.customerDisplayName ??
        invoice?.customerId?.displayName ??
        invoice?.name ??
        "";

      if (!customerName || typeof customerName !== "string") {
        return;
      }

      const nameKey = customerName.trim().toLowerCase();
      if (!nameKey) {
        return;
      }

      const total = parseFloat(invoice?.total ?? invoice?.amount ?? "0");
      const paid = parseFloat(invoice?.paidAmount ?? invoice?.received ?? "0");
      const status = String(invoice?.status ?? "").toLowerCase();

      if (!map.has(nameKey)) {
        map.set(nameKey, { customerKey: nameKey, remaining: 0, received: 0 });
      }

      const fin = map.get(nameKey)!;

      if (status === "paid") {
        fin.received += total;
      } else if (status === "partially paid") {
        fin.received += paid;
        fin.remaining += total - paid;
      } else if (
        status === "sent" ||
        status === "overdue" ||
        status === "draft"
      ) {
        fin.remaining += total;
      }
    });

    return map;
  }, [rawInvoices]);

  const currencyStats = useMemo(() => {
    const stats = new Map<string, { received: number; remaining: number }>();

    rawInvoices.forEach((invoice) => {
      const currency = invoice.currency || "PKR";
      const total = parseFloat(invoice.total || invoice.amount || "0");
      const paid = parseFloat(invoice.paidAmount || invoice.received || "0");
      const status = String(invoice.status || "").toLowerCase();

      if (!stats.has(currency)) {
        stats.set(currency, { received: 0, remaining: 0 });
      }

      const current = stats.get(currency)!;

      if (status === "paid") {
        current.received += total;
      } else if (status === "partially paid") {
        current.received += paid;
        current.remaining += total - paid;
      } else if (status === "sent" || status === "overdue") {
        current.remaining += total;
      } else if (status === "draft") {
        current.remaining += total;
      }
    });

    return Array.from(stats.entries()).map(([currency, values]) => ({
      currency,
      ...values,
    }));
  }, [rawInvoices]);

  const getCustomerFinancials = useCallback(
    (customerDisplayName: string): CustomerFinancials => {
      const nameKey = customerDisplayName.trim().toLowerCase();
      const result = customerFinancials.get(nameKey) ?? {
        customerKey: nameKey,
        remaining: 0,
        received: 0,
      };

      return result;
    },
    [customerFinancials]
  );

  return {
    items,
    rawInvoices,
    loading: isLoading,
    isValidating,
    error: swrError
      ? swrError?.response?.data?.message ||
        swrError?.message ||
        "Failed to load invoices"
      : "",
    refetch: () => mutate(),
    customerFinancials,
    getCustomerFinancials,
    currencyStats,
  };
}
