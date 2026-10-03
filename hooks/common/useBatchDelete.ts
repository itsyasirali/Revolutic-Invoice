"use client";

import { useState, useCallback } from "react";
import axios from "@/lib/axios";
import { toast } from "@/components/ui";

interface Options {
  /** e.g. "/expenses/batch-delete" */
  endpoint: string;
  /** Property that holds the ids in the request body, e.g. "expenses" */
  bodyKey: string;
  noun: string; // "expense"
  invalidate: () => Promise<unknown>;
}

/** Confirm-dialog + batch delete flow, same shape as useDeleteItems. */
const useBatchDelete = ({ endpoint, bodyKey, noun, invalidate }: Options) => {
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    selectedIds: (string | number)[];
    onDone?: () => void;
  }>({ show: false, selectedIds: [] });

  const hideConfirmDialog = () => setConfirmDialog({ show: false, selectedIds: [] });

  const requestDelete = useCallback(
    (ids: (string | number)[], onDone?: () => void) => {
      if (!ids.length) return;
      setConfirmDialog({ show: true, selectedIds: ids, onDone });
    },
    [],
  );

  const confirmDelete = async () => {
    const { selectedIds, onDone } = confirmDialog;
    setLoading(true);
    try {
      await axios.delete(endpoint, {
        data: { [bodyKey]: selectedIds.map(String) },
      });
      toast.error(
        selectedIds.length > 1 ? `${noun}s deleted successfully` : `${noun} deleted successfully`,
        "Deleted",
      );
      await invalidate();
      onDone?.();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        error.response?.data?.message || error.message || `Failed to delete ${noun}s`,
        "Delete Failed",
      );
    } finally {
      setLoading(false);
      hideConfirmDialog();
    }
  };

  return { loading, confirmDialog, requestDelete, confirmDelete, hideConfirmDialog };
};

export default useBatchDelete;
