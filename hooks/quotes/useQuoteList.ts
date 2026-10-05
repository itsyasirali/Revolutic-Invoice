"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import useRecords from "@/hooks/common/useRecords";
import useBatchDelete from "@/hooks/common/useBatchDelete";
import useCustomerOptions from "@/hooks/common/useCustomerOptions";
import { SWR_KEYS, invalidateQuotes } from "@/lib/swr";
import { downloadCsv } from "@/lib/csv";
import { customerLabel, formatDate, sumByCurrency, toDateInput } from "@/lib/format";
import { QUOTE_STATUSES, type Quote } from "@/types/quote";

const ALL = "All";

const useQuoteList = (initial?: Quote[]) => {
  const router = useRouter();
  const { records, loading, error, refetch } = useRecords<Quote>(
    SWR_KEYS.quotes,
    "quotes",
    initial,
  );
  const { options: customerOptions } = useCustomerOptions();

  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || "";
  const [search, setSearch] = useState(urlSearch);
  useEffect(() => setSearch(urlSearch), [urlSearch]);

  const [statusFilter, setStatusFilter] = useState(ALL);
  const [customerFilter, setCustomerFilter] = useState(ALL);
  const [currencyFilter, setCurrencyFilter] = useState(ALL);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const del = useBatchDelete({
    endpoint: "/quotes/batch-delete",
    bodyKey: "quotes",
    noun: "Quote",
    invalidate: invalidateQuotes,
  });

  const currencyOptions = useMemo(
    () => [ALL, ...Array.from(new Set(records.map((q) => q.currency))).sort()],
    [records],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return records.filter((r) => {
      if (statusFilter !== ALL && r.status !== statusFilter) return false;
      if (customerFilter !== ALL && String(r.customerId) !== customerFilter) return false;
      if (currencyFilter !== ALL && r.currency !== currencyFilter) return false;
      const day = toDateInput(r.quoteDate);
      if (dateRange.from && day < dateRange.from) return false;
      if (dateRange.to && day > dateRange.to) return false;
      if (!q) return true;
      return [r.quoteNumber, r.referenceNumber, customerLabel(r.customer)].some((v) =>
        (v || "").toLowerCase().includes(q),
      );
    });
  }, [records, search, statusFilter, customerFilter, currencyFilter, dateRange]);


  const summary = useMemo(() => {
    const valueOf = (statuses: string[]) =>
      sumByCurrency(
        filtered.filter((q) => statuses.includes(q.status)),
        (q) => q.total,
        (q) => q.currency,
      );
    return {
      count: String(filtered.length),
      draft: filtered.filter((q) => q.status === "Draft").length,
      pending: valueOf(["Sent", "Viewed"]),
      accepted: valueOf(["Accepted", "Converted"]),
      value: sumByCurrency(filtered, (q) => q.total, (q) => q.currency),
    };
  }, [filtered]);

  const hasActiveFilters =
    !!search || statusFilter !== ALL || customerFilter !== ALL || currencyFilter !== ALL ||
    !!dateRange.from || !!dateRange.to;

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter(ALL);
    setCustomerFilter(ALL);
    setCurrencyFilter(ALL);
    setDateRange({ from: "", to: "" });
  }, []);

  const onSelectAll = useCallback(
    (checked: boolean) => setSelectedIds(checked ? filtered.map((q) => String(q.id)) : []),
    [filtered],
  );
  const onSelectRow = useCallback((id: string | number, checked: boolean) => {
    const stringId = String(id);
    setSelectedIds((prev) =>
      checked ? [...prev, stringId] : prev.filter((x) => x !== stringId),
    );
  }, []);

  const handleExport = () =>
    downloadCsv("quotes.csv", [
      ["Quote #", "Customer", "Quote Date", "Expiry Date", "Subtotal", "Discount", "Shipping", "Adjustment", "Total", "Currency", "Status"],
      ...filtered.map((q) => [
        q.quoteNumber, customerLabel(q.customer), formatDate(q.quoteDate), formatDate(q.expiryDate),
        q.subTotal, q.discount, q.shipping, q.adjustment, q.total, q.currency, q.status,
      ]),
    ]);

  return {
    loading: loading || del.loading,
    initialLoading: loading,
    error,
    refetch,
    quotes: filtered,
    totalCount: filtered.length,
    summary,
    selectedIds,
    onSelectAll,
    onSelectRow,
    search, setSearch,
    statusFilter, setStatusFilter,
    statusOptions: [ALL, ...QUOTE_STATUSES],
    customerFilter, setCustomerFilter,
    customerOptions: [{ label: "All customers", value: ALL }, ...customerOptions],
    currencyFilter, setCurrencyFilter, currencyOptions,
    dateRange, setDateRange,
    hasActiveFilters,
    clearFilters,
    confirmDialog: del.confirmDialog,
    confirmDelete: del.confirmDelete,
    hideConfirmDialog: del.hideConfirmDialog,
    handleNew: () => router.push("/quotes/new"),
    handleEdit: (q: Quote) => router.push(`/quotes/edit/${q.id}`),
    handleRowClick: (q: Quote) => router.push(`/quotes/${q.id}`),
    handleDelete: (ids?: (string | number)[]) =>
      del.requestDelete(ids && ids.length ? ids : selectedIds, () => setSelectedIds([])),
    handleExport,
  };
};

export default useQuoteList;
