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
  invalidateExpenses,
  invalidateExpensesAndInvoices,
} from "@/lib/swr";
import { downloadCsv, parseCsv } from "@/lib/csv";
import { customerLabel, formatDate, sumByCurrency, toDateInput } from "@/lib/format";
import type { Expense } from "@/types/expense";

const ALL = "All";

const useExpenseList = (initialExpenses?: Expense[]) => {
  const router = useRouter();
  const { records, loading, error, refetch } = useRecords<Expense>(
    SWR_KEYS.expenses,
    "expenses",
    initialExpenses,
  );
  const { customers, options: customerOptions } = useCustomerOptions();

  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || "";
  const [search, setSearch] = useState(urlSearch);
  useEffect(() => setSearch(urlSearch), [urlSearch]);

  const [customerFilter, setCustomerFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [billableFilter, setBillableFilter] = useState(ALL);
  const [currencyFilter, setCurrencyFilter] = useState(ALL);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [busy, setBusy] = useState(false);

  const { loading: deleteLoading, confirmDialog, requestDelete, confirmDelete, hideConfirmDialog } =
    useBatchDelete({
      endpoint: "/expenses/batch-delete",
      bodyKey: "expenses",
      noun: "Expense",
      invalidate: invalidateExpenses,
    });

  const categoryOptions = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(records.map((e) => e.category?.name).filter(Boolean) as string[]),
      ).sort(),
    ],
    [records],
  );
  const currencyOptions = useMemo(
    () => [ALL, ...Array.from(new Set(records.map((e) => e.currency))).sort()],
    [records],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return records.filter((e) => {
      if (customerFilter !== ALL && String(e.customerId ?? "") !== customerFilter) return false;
      if (statusFilter !== ALL && e.status !== statusFilter) return false;
      if (categoryFilter !== ALL && e.category?.name !== categoryFilter) return false;
      if (billableFilter === "Billable" && !e.billable) return false;
      if (billableFilter === "Non-Billable" && e.billable) return false;
      if (currencyFilter !== ALL && e.currency !== currencyFilter) return false;
      const day = toDateInput(e.expenseDate);
      if (dateRange.from && day < dateRange.from) return false;
      if (dateRange.to && day > dateRange.to) return false;
      if (!q) return true;
      return [
        e.expenseNumber,
        e.vendor,
        e.description,
        e.referenceNumber,
        e.category?.name,
        customerLabel(e.customer),
      ].some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [records, search, statusFilter, customerFilter, categoryFilter, billableFilter, currencyFilter, dateRange]);


  const summary = useMemo(() => {
    const monthKey = toDateInput(new Date()).slice(0, 7);
    return {
      total: sumByCurrency(filtered, (e) => e.total, (e) => e.currency),
      thisMonth: sumByCurrency(
        filtered.filter((e) => toDateInput(e.expenseDate).startsWith(monthKey)),
        (e) => e.total,
        (e) => e.currency,
      ),
      unbilled: sumByCurrency(
        filtered.filter((e) => e.billable && !e.invoiced),
        (e) => e.total,
        (e) => e.currency,
      ),
      invoiced: sumByCurrency(
        filtered.filter((e) => e.invoiced),
        (e) => e.total,
        (e) => e.currency,
      ),
    };
  }, [filtered]);

  const hasActiveFilters =
    !!search ||
    customerFilter !== ALL ||
    categoryFilter !== ALL ||
    billableFilter !== ALL ||
    currencyFilter !== ALL ||
    !!dateRange.from ||
    !!dateRange.to;

  const clearFilters = useCallback(() => {
    setSearch("");
    setCustomerFilter(ALL);
    setCategoryFilter(ALL);
    setBillableFilter(ALL);
    setCurrencyFilter(ALL);
    setDateRange({ from: "", to: "" });
  }, []);

  const onSelectAll = useCallback(
    (checked: boolean) => setSelectedIds(checked ? filtered.map((e) => e.id) : []),
    [filtered],
  );
  const onSelectRow = useCallback((id: string | number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }, []);

  const handleNew = () => router.push("/expenses/new");
  const handleEdit = (e: Expense) => router.push(`/expenses/edit/${e.id}`);
  const handleRowClick = (e: Expense) => router.push(`/expenses/${e.id}`);
  const handleDelete = (ids?: (string | number)[]) =>
    requestDelete(ids && ids.length ? ids : selectedIds, () => setSelectedIds([]));

  const handleExport = () => {
    downloadCsv("expenses.csv", [
      ["Expense #", "Date", "Vendor", "Customer", "Category", "Description", "Amount", "Tax", "Total", "Currency", "Payment Method", "Reference", "Billable", "Status"],
      ...filtered.map((e) => [
        e.expenseNumber, formatDate(e.expenseDate), e.vendor, customerLabel(e.customer),
        e.category?.name, e.description, e.amount, e.tax, e.total, e.currency,
        e.paymentMethod, e.referenceNumber, e.billable ? "Yes" : "No", e.status,
      ]),
    ]);
  };

  /** CSV columns: date,vendor,customer,category,description,amount,taxPercent,currency,billable,paymentMethod,referenceNumber,notes */
  const handleImport = async (file: File) => {
    setBusy(true);
    try {
      const [header, ...rows] = parseCsv(await file.text());
      if (!header || rows.length === 0) {
        toast.error("The CSV file has no rows to import", "Import Failed");
        return;
      }
      const col = (name: string) => header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
      let created = 0;
      const failures: string[] = [];
      for (const [i, row] of rows.entries()) {
        const get = (name: string) => (col(name) >= 0 ? (row[col(name)] || "").trim() : "");
        const customerName = get("customer").toLowerCase();
        const customer = customers.find((c) => customerLabel(c).toLowerCase() === customerName);
        try {
          await axios.post("/expenses", {
            expenseDate: get("date") || new Date().toISOString(),
            vendor: get("vendor"),
            customerId: customer?.id ?? null,
            categoryName: get("category"),
            description: get("description"),
            amount: get("amount"),
            taxPercent: get("taxPercent") || 0,
            currency: get("currency") || "PKR",
            billable: ["yes", "true", "1"].includes(get("billable").toLowerCase()),
            paymentMethod: get("paymentMethod"),
            referenceNumber: get("referenceNumber"),
            notes: get("notes"),
          });
          created++;
        } catch (err) {
          const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
          failures.push(`Row ${i + 2}: ${msg || "failed"}`);
        }
      }
      await invalidateExpenses();
      if (created) toast.success(`${created} expense(s) imported`, "Import Complete");
      if (failures.length) toast.error(failures.slice(0, 3).join("; "), `${failures.length} row(s) skipped`);
    } finally {
      setBusy(false);
    }
  };

  const handleCreateInvoice = async () => {
    const chosen = records.filter((e) => selectedIds.includes(e.id));
    if (chosen.some((e) => !e.billable || e.invoiced)) {
      toast.error("Select billable expenses that are not yet invoiced", "Cannot create invoice");
      return;
    }
    setBusy(true);
    try {
      const res = await axios.post("/expenses/invoice", { expenseIds: selectedIds });
      await invalidateExpensesAndInvoices();
      toast.success("Invoice created from expenses", "Invoice Created");
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
    loading: loading || deleteLoading || busy,
    initialLoading: loading,
    error,
    refetch,
    expenses: filtered,
    totalCount: filtered.length,
    summary,
    selectedIds,
    onSelectAll,
    onSelectRow,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    customerFilter,
    setCustomerFilter,
    customerOptions: [{ label: "All customers", value: ALL }, ...customerOptions],
    categoryFilter,
    setCategoryFilter,
    categoryOptions,
    billableFilter,
    setBillableFilter,
    currencyFilter,
    setCurrencyFilter,
    currencyOptions,
    dateRange,
    setDateRange,
    hasActiveFilters,
    clearFilters,
    confirmDialog,
    confirmDelete,
    hideConfirmDialog,
    handleNew,
    handleEdit,
    handleRowClick,
    handleDelete,
    handleExport,
    handleImport,
    handleCreateInvoice,
  };
};

export default useExpenseList;
