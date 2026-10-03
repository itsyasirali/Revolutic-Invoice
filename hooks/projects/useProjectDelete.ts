"use client";

import { useState, useCallback } from "react";
import axios from "@/lib/axios";
import { toast } from "@/components/ui";
import { invalidateProjects, invalidateQuotes } from "@/lib/swr";

/** Confirm-dialog delete flow; projects are deleted one request per id. */
const useProjectDelete = () => {
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    selectedIds: (string | number)[];
    onDone?: () => void;
  }>({ show: false, selectedIds: [] });

  const hideConfirmDialog = () => setConfirmDialog({ show: false, selectedIds: [] });

  const requestDelete = useCallback((ids: (string | number)[], onDone?: () => void) => {
    if (ids.length) setConfirmDialog({ show: true, selectedIds: ids, onDone });
  }, []);

  const confirmDelete = async () => {
    const { selectedIds, onDone } = confirmDialog;
    setLoading(true);
    let deleted = 0;
    const failures: string[] = [];
    for (const id of selectedIds) {
      try {
        await axios.delete(`/projects/${id}`);
        deleted++;
      } catch (err) {
        failures.push(
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            "Failed to delete project",
        );
      }
    }
    await Promise.all([invalidateProjects(), invalidateQuotes()]);
    if (deleted) toast.error(`${deleted} project(s) deleted successfully`, "Deleted");
    if (failures.length) toast.error(failures[0], "Delete Failed");
    if (deleted) onDone?.();
    setLoading(false);
    hideConfirmDialog();
  };

  return { loading, confirmDialog, requestDelete, confirmDelete, hideConfirmDialog };
};

export default useProjectDelete;
