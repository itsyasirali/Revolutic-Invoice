"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import useRecords from "@/hooks/common/useRecords";
import useBatchDelete from "@/hooks/common/useBatchDelete";
import useCustomerOptions from "@/hooks/common/useCustomerOptions";
import { toast } from "@/components/ui";
import {
  SWR_KEYS,
  invalidateTimeEntries,
  invalidateTimeEntriesAndInvoices,
} from "@/lib/swr";
import { downloadCsv } from "@/lib/csv";
import { customerLabel, formatDate, formatMoney, sumByCurrency, toDateInput } from "@/lib/format";
import { formatDuration, userDisplayName, type TimeEntry } from "@/types/timeEntry";

const ALL = "All";

const useTimeEntryList = (initial?: TimeEntry[]) => {
  const router = useRouter();
  const { records, loading, error, refetch } = useRecords<TimeEntry>(
    SWR_KEYS.timeEntries,
    "timeEntries",
    initial,
  );
  const { options: customerOptions } = useCustomerOptions();

  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || "";
  const [search, setSearch] = useState(urlSearch);
  useEffect(() => setSearch(urlSearch), [urlSearch]);

  const [userFilter, setUserFilter] = useState(ALL);
  const [customerFilter, setCustomerFilter] = useState(ALL);
  const [projectFilter, setProjectFilter] = useState(ALL);
  const [billableFilter, setBillableFilter] = useState(ALL);
  const [invoicedFilter, setInvoicedFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [busy, setBusy] = useState(false);

  const del = useBatchDelete({
    endpoint: "/time-tracking/batch-delete",
    bodyKey: "timeEntries",
    noun: "Time entry",
    invalidate: invalidateTimeEntries,
  });

  const userOptions = useMemo(() => {
    const seen = new Map<string, string>();
    records.forEach((r) => r.user && seen.set(String(r.userId), userDisplayName(r.user) || `User ${r.userId}`));
    return [
      { label: "All users", value: ALL },
      ...Array.from(seen, ([value, label]) => ({ label, value })),
    ];
  }, [records]);

  const projectOptions = useMemo(
    () => [ALL, ...Array.from(new Set(records.map((r) => r.project).filter(Boolean) as string[])).sort()],
    [records],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return records.filter((r) => {
      if (userFilter !== ALL && String(r.userId) !== userFilter) return false;
      if (customerFilter !== ALL && String(r.customerId ?? "") !== customerFilter) return false;
      if (projectFilter !== ALL && r.project !== projectFilter) return false;
      if (billableFilter === "Billable" && !r.billable) return false;
      if (billableFilter === "Non-Billable" && r.billable) return false;
      if (invoicedFilter === "Invoiced" && !r.invoiced) return false;
      if (invoicedFilter === "Not Invoiced" && r.invoiced) return false;
      if (statusFilter !== ALL && r.status !== statusFilter) return false;
      const day = toDateInput(r.date);
      if (dateRange.from && day < dateRange.from) return false;
      if (dateRange.to && day > dateRange.to) return false;
      if (!q) return true;
      return [r.entryNumber, r.description, r.project, customerLabel(r.customer)].some((v) =>
        (v || "").toLowerCase().includes(q),
      );
    });
  }, [records, search, userFilter, customerFilter, projectFilter, billableFilter, invoicedFilter, statusFilter, dateRange]);


  const summary = useMemo(() => {
    const minutes = (rows: TimeEntry[]) => rows.reduce((s, r) => s + r.duration, 0);
    const billable = filtered.filter((r) => r.billable);
    return {
      totalHours: formatDuration(minutes(filtered)),
      billableHours: formatDuration(minutes(billable)),
      nonBillableHours: formatDuration(minutes(filtered.filter((r) => !r.billable))),
      unbilledAmount: sumByCurrency(
        billable.filter((r) => !r.invoiced),
        (r) => r.amount,
        (r) => r.customer?.currency || "PKR",
      ),
    };
  }, [filtered]);

  const hasActiveFilters =
    !!search || [userFilter, customerFilter, projectFilter, billableFilter, invoicedFilter, statusFilter].some((v) => v !== ALL) ||
    !!dateRange.from || !!dateRange.to;

  const clearFilters = useCallback(() => {
    setSearch("");
    setUserFilter(ALL);
    setCustomerFilter(ALL);
    setProjectFilter(ALL);
    setBillableFilter(ALL);
    setInvoicedFilter(ALL);
    setStatusFilter(ALL);
    setDateRange({ from: "", to: "" });
  }, []);

  const onSelectAll = useCallback(
    (checked: boolean) => setSelectedIds(checked ? filtered.map((r) => r.id) : []),
    [filtered],
  );
  const onSelectRow = useCallback((id: string | number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }, []);

  const handleExport = () =>
    downloadCsv("time-entries.csv", [
      ["Entry #", "Date", "User", "Customer", "Project", "Description", "Start", "End", "Hours", "Rate", "Amount", "Billable", "Status"],
      ...filtered.map((r) => [
        r.entryNumber, formatDate(r.date), userDisplayName(r.user), customerLabel(r.customer),
        r.project, r.description, r.startTime, r.endTime, (r.duration / 60).toFixed(2),
        r.hourlyRate, r.amount, r.billable ? "Yes" : "No", r.status,
      ]),
    ]);

  const handleCreateInvoice = async () => {
    const chosen = records.filter((r) => selectedIds.includes(r.id));
    if (chosen.some((r) => !r.billable || r.invoiced)) {
      toast.error("Select billable time entries that are not yet invoiced", "Cannot create invoice");
      return;
    }
    setBusy(true);
    try {
      const res = await axios.post("/time-tracking/invoice", { timeEntryIds: selectedIds });
      await invalidateTimeEntriesAndInvoices();
      toast.success("Invoice created from time entries", "Invoice Created");
      setSelectedIds([]);
      router.push(`/invoices/${res.data.invoice.id}`);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Failed to create invoice", "Error");
    } finally {
      setBusy(false);
    }
  };

  return {
    loading: loading || del.loading || busy,
    initialLoading: loading,
    error,
    refetch,
    entries: filtered,
    totalCount: filtered.length,
    summary,
    selectedIds,
    onSelectAll,
    onSelectRow,
    search,
    setSearch,
    userFilter, setUserFilter, userOptions,
    customerFilter, setCustomerFilter,
    customerOptions: [{ label: "All customers", value: ALL }, ...customerOptions],
    projectFilter, setProjectFilter, projectOptions,
    billableFilter, setBillableFilter,
    invoicedFilter, setInvoicedFilter,
    statusFilter, setStatusFilter,
    dateRange, setDateRange,
    hasActiveFilters,
    clearFilters,
    confirmDialog: del.confirmDialog,
    confirmDelete: del.confirmDelete,
    hideConfirmDialog: del.hideConfirmDialog,
    handleNew: () => router.push("/time-tracking/new"),
    handleEdit: (r: TimeEntry) => router.push(`/time-tracking/edit/${r.id}`),
    handleRowClick: (r: TimeEntry) => router.push(`/time-tracking/${r.id}`),
    handleDelete: (ids?: (string | number)[]) =>
      del.requestDelete(ids && ids.length ? ids : selectedIds, () => setSelectedIds([])),
    handleExport,
    handleCreateInvoice,
    formatMoney,
  };
};

export default useTimeEntryList;
