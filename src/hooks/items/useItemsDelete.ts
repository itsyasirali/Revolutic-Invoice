import { useState, useCallback, useRef } from "react";
import axios from "../../Service/axios";

type AlertState = {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
};

type ConfirmState = {
  show: boolean;
  selectedIds: (string | number)[];
};

const useDeleteItems = () => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ show: false, type: 'info', message: '' });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>({ show: false, selectedIds: [] });
  const refetchRef = useRef<(() => void) | undefined>(undefined);

  const dismissAlert = () => {
    setAlert({ show: false, type: 'info', message: '' });
  };

  const hideConfirmDialog = () => {
    setConfirmDialog({ show: false, selectedIds: [] });
  };

  const performDelete = async (selectedIds: (string | number)[], refetch?: () => void) => {
    setLoading(true);
    dismissAlert();

    try {
      await axios.delete(`/items/batch-delete`, {
        data: { items: selectedIds.map(String) }
      });

      setAlert({
        show: true,
        type: 'success',
        message: `Successfully deleted ${selectedIds.length} item(s)`
      });

      if (refetch) refetch();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error.response?.data?.message || error.message || "Failed to delete items";
      setAlert({
        show: true,
        type: 'error',
        message: msg
      });
    } finally {
      setLoading(false);
      hideConfirmDialog();
    }
  };

  const deleteItems = useCallback(
    async (selectedIds: (string | number)[], refetch?: () => void): Promise<void> => {
      if (!selectedIds.length) return;

      setConfirmDialog({
        show: true,
        selectedIds,
      });

      if (refetch) {
        refetchRef.current = refetch;
      }
    },
    []
  );

  const confirmDelete = () => {
    performDelete(confirmDialog.selectedIds, refetchRef.current);
    refetchRef.current = undefined;
  };

  return {
    deleteItems,
    loading,
    alert,
    dismissAlert,
    confirmDialog,
    confirmDelete,
    hideConfirmDialog,
  };
};

export default useDeleteItems;
