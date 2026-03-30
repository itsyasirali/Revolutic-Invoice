import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import usePaymentsData from "./usePayments";
import type { Payment, UsePaymentsListReturn } from "../../types/Payment.d";

export const PAYMENT_MODE_FILTERS = [
  "All",
  "Cash",
  "Bank Transfer",
  "Bank Remittance",
  "Cheque",
  "Other",
] as const;

const usePaymentsList = (): UsePaymentsListReturn => {
  const navigate = useNavigate();
  const {
    payments,
    loading,
    deletePayments,
    mutating,
    mutateError,
    refetch,
  } = usePaymentsData();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modeFilter, setModeFilter] = useState<(typeof PAYMENT_MODE_FILTERS)[number]>("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Unified alert state
  const [alert, setAlert] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
    show: false,
    type: 'info',
    message: ''
  });

  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; selectedIds: string[] }>({
    show: false,
    selectedIds: []
  });

  const dismissAlert = useCallback(() => {
    setAlert({ show: false, type: 'info', message: '' });
  }, []);

  const hideConfirmDialog = useCallback(() => {
    setConfirmDialog({ show: false, selectedIds: [] });
  }, []);


  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredPayments = useMemo<Payment[]>(() => {
    if (!Array.isArray(payments)) return [];
    if (modeFilter === "All") return payments;

    return payments.filter(
      (payment) =>
        (payment.paymentMode || "").toLowerCase() === modeFilter.toLowerCase()
    );
  }, [payments, modeFilter]);

  const onSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? filteredPayments.map((payment) => payment.id) : []);
    },
    [filteredPayments]
  );

  const onSelectRow = useCallback((id: string | number, checked: boolean) => {
    const stringId = String(id);
    setSelectedIds((prev) => (checked ? [...prev, stringId] : prev.filter((existingId) => existingId !== stringId)));
  }, []);

  const handleNew = useCallback(() => {
    sessionStorage.removeItem("payment");
    navigate("/payments/new");
  }, [navigate]);

  const handleEditSelected = useCallback(() => {
    if (selectedIds.length !== 1) return;
    navigate(`/payments/${selectedIds[0]}`);
  }, [navigate, selectedIds]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedIds.length) return;
    setConfirmDialog({ show: true, selectedIds });
  }, [selectedIds]);

  const confirmDelete = useCallback(async () => {
    if (!confirmDialog.selectedIds.length) return;
    try {
      await deletePayments(confirmDialog.selectedIds);
      setAlert({ show: true, type: 'success', message: 'Payments deleted successfully' });
      setSelectedIds([]);
      hideConfirmDialog();
    } catch (error: any) {
      setAlert({ show: true, type: 'error', message: error?.message || 'Failed to delete payments' });
      hideConfirmDialog();
    }
  }, [confirmDialog.selectedIds, deletePayments, hideConfirmDialog]);


  const clearSelection = useCallback(() => setSelectedIds([]), []);

  return {
    payments: filteredPayments,
    rawPayments: payments,
    loading,
    deleting: mutating,
    mutateError,
    alert,
    confirmDialog,
    confirmDelete,
    hideConfirmDialog,
    dismissAlert,
    refetch,
    selectedIds,
    setSelectedIds,
    dropdownOpen,
    setDropdownOpen,
    dropdownRef,
    modeFilter,
    setModeFilter,
    onSelectAll,
    onSelectRow,
    handleNew,
    handleEditSelected,
    handleDeleteSelected,
    clearSelection,
  };
};

export default usePaymentsList;

