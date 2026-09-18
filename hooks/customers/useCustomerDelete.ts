"use client";

import { useState, useCallback, useRef } from "react";
import axios from "@/lib/axios";
import { invalidateCustomers } from "@/lib/swr";
import { toast } from "@/components/ui";

type AlertState = {
  show: boolean;
  type: "success" | "error" | "warning" | "info";
  message: string;
};

type ConfirmState = {
  show: boolean;
  selectedIds: string[];
};

const useDeleteCustomer = () => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>({
    show: false,
    selectedIds: [],
  });

  const dismissAlert = () => {
    setAlert({ show: false, type: "info", message: "" });
  };

  const hideConfirmDialog = () => {
    setConfirmDialog({ show: false, selectedIds: [] });
  };

  const performDelete = async (selectedIds: string[], refetch?: () => void) => {
    setLoading(true);
    dismissAlert();

    try {
      await axios.delete(`/customers/batch-delete`, {
        data: { customers: selectedIds.map(String) },
      });

      await invalidateCustomers();
      toast.error(
        selectedIds.length > 1
          ? "Customers deleted successfully"
          : "Customer deleted successfully",
        "Deleted"
      );
      if (refetch) refetch();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete customers";
      toast.error(msg, "Delete Failed");
    } finally {
      setLoading(false);
      hideConfirmDialog();
    }
  };

  const refetchRef = useRef<(() => void) | undefined>(undefined);

  const deleteCustomers = useCallback(
    async (selectedIds: string[], refetch?: () => void): Promise<void> => {
      if (!selectedIds.length) return;

      setConfirmDialog({
        show: true,
        selectedIds,
      });

      if (refetch) {
        refetchRef.current = refetch;
      }
    },
    [],
  );

  const confirmDelete = () => {
    performDelete(confirmDialog.selectedIds, refetchRef.current);
    refetchRef.current = undefined;
  };

  return {
    deleteCustomers,
    loading,
    alert,
    dismissAlert,
    confirmDialog,
    confirmDelete,
    hideConfirmDialog,
  };
};

export default useDeleteCustomer;
