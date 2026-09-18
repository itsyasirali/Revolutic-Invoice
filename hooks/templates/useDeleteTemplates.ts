"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { invalidateTemplates } from "@/lib/swr";
import type { UseDeleteTemplatesReturn } from "@/types/template";
import { toast } from "@/components/ui";

const useDeleteTemplates = (): UseDeleteTemplatesReturn => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "warning" | "info";
    message: string;
  }>({
    show: false,
    type: "info",
    message: "",
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    selectedIds: string[];
  }>({
    show: false,
    selectedIds: [],
  });

  const deleteTemplates = async (ids: string[]) => {
    setConfirmDialog({ show: true, selectedIds: ids });
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);

      for (const id of confirmDialog.selectedIds) {
        await axios.delete(`/templates/${id}`);
      }

      toast.success(
        confirmDialog.selectedIds.length > 1
          ? "Templates deleted successfully"
          : "Template deleted successfully",
        "Deleted"
      );
      setAlert({
        show: true,
        type: "success",
        message: `${confirmDialog.selectedIds.length} template(s) deleted successfully`,
      });

      await invalidateTemplates();
      setConfirmDialog({ show: false, selectedIds: [] });
    } catch (err: any) {
      console.error("Error deleting templates:", err);
      const msg = err.response?.data?.message || "Failed to delete templates";
      toast.error(msg, "Delete Failed");
      setAlert({
        show: true,
        type: "error",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const hideConfirmDialog = () => {
    setConfirmDialog({ show: false, selectedIds: [] });
  };

  const dismissAlert = () => {
    setAlert({ show: false, type: "info", message: "" });
  };

  return {
    deleteTemplates,
    loading,
    alert,
    dismissAlert,
    confirmDialog,
    confirmDelete,
    hideConfirmDialog,
  };
};

export default useDeleteTemplates;
