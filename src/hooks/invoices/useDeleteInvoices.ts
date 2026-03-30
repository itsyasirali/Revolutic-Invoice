import { useState, useCallback } from 'react';
import axios from '../../Service/axios';

type AlertState = {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
};

type ConfirmState = {
  show: boolean;
  selectedIds: (string | number)[];
};

const useDeleteInvoices = () => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ show: false, type: 'info', message: '' });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>({ show: false, selectedIds: [] });

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
      // Delete invoices one by one (NestJS endpoint is DELETE /invoices/:id)
      for (const id of selectedIds) {
        await axios.delete(`/invoices/${id}`);
      }

      setAlert({
        show: true,
        type: 'success',
        message: `Successfully deleted ${selectedIds.length} invoice(s)`
      });

      if (refetch) refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to delete invoices';
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

  const deleteInvoices = useCallback(
    async (selectedIds: (string | number)[], refetch?: () => void): Promise<void> => {
      if (!selectedIds.length) return;

      // Store the refetch callback with the selectedIds
      setConfirmDialog({
        show: true,
        selectedIds,
      });

      // Return the refetch callback to be used later
      if (refetch) {
        (window as any).__deleteRefetch = refetch;
      }
    },
    []
  );

  const confirmDelete = () => {
    const refetch = (window as any).__deleteRefetch;
    performDelete(confirmDialog.selectedIds, refetch);
    delete (window as any).__deleteRefetch;
  };

  return {
    deleteInvoices,
    loading,
    alert,
    dismissAlert,
    confirmDialog,
    confirmDelete,
    hideConfirmDialog,
  };
};

export default useDeleteInvoices;
