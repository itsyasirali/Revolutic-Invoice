"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import useInvoicesData, { type UIInvoiceListItem } from "./useInvoicesData";
import useDeleteInvoices from "./useDeleteInvoices";
import useInvoiceActions from "./useInvoiceActions";

const useInvoiceList = () => {
  const { items, loading, refetch } = useInvoicesData();
  const {
    deleteInvoices,
    loading: deleteLoading,
    alert: deleteAlert,
    dismissAlert: dismissDeleteAlert,
    confirmDialog,
    confirmDelete,
    hideConfirmDialog,
  } = useDeleteInvoices();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("search") || "";

  // Unified alert state
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "warning" | "info";
    message: string;
  }>({
    show: false,
    type: "info",
    message: "",
  });

  const dismissAlert = useCallback(() => {
    setAlert({ show: false, type: "info", message: "" });
    dismissDeleteAlert();
  }, [dismissDeleteAlert]);

  const { handleNew, handleDelete, handleRowClick, handleEdit } =
    useInvoiceActions({
      selectedIds,
      setSelectedIds,
      deleteInvoices,
      refetch,
    });

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return items.filter((invoice: UIInvoiceListItem) => {
      const statusValue = invoice.status?.tooltip?.toLowerCase() || "";
      const matchesStatus =
        statusFilter === "All" ||
        statusValue === statusFilter.toLowerCase();
      const matchesSearch =
        !query ||
        (invoice.invoice || "").toLowerCase().includes(query) ||
        (invoice.name || "").toLowerCase().includes(query) ||
        (invoice.email || "").toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [items, statusFilter, searchQuery]);

  const onSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedIds(
        checked
          ? filteredInvoices.map((i: UIInvoiceListItem) => String(i.id))
          : []
      );
    },
    [filteredInvoices]
  );

  const onSelectRow = useCallback((id: string | number, checked: boolean) => {
    const stringId = String(id);
    setSelectedIds((prev) =>
      checked ? [...prev, stringId] : prev.filter((x) => x !== stringId)
    );
  }, []);

  return {
    // State
    filteredInvoices,
    selectedIds,
    setSelectedIds,
    statusFilter,
    setStatusFilter,
    dropdownOpen,
    setDropdownOpen,
    loading: loading || deleteLoading,
    alert: deleteAlert.show ? deleteAlert : alert,
    confirmDialog,

    // Handlers
    onSelectAll,
    onSelectRow,
    handleNew,
    handleEdit,
    handleDelete,
    handleRowClick,
    confirmDelete,
    hideConfirmDialog,
    dismissAlert,
    refetch,
  };
};

export default useInvoiceList;
