import { useState, useCallback } from "react";
import axios from "../../Service/axios";

type AlertState = {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
};

const useUpdateItemStatus = () => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ show: false, type: 'info', message: '' });

  const dismissAlert = () => {
    setAlert({ show: false, type: 'info', message: '' });
  };

  const updateStatus = useCallback(
    async (
      selectedIds: (string | number)[],
      status: "Active" | "inActive",
      refetch: () => void
    ): Promise<void> => {
      if (selectedIds.length === 0) return;

      setLoading(true);
      dismissAlert();

      try {
        await axios.put(
          `/items/batch-update`,
          { status, items: selectedIds.map(String) }
        );

        // Success alert suppressed as per user request
        refetch();
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        const msg = error.response?.data?.message || error.message || "Error updating item status";
        setAlert({
          show: true,
          type: 'error',
          message: msg
        });
        console.error("Error updating item status:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateStatus, loading, alert, dismissAlert };
};

export default useUpdateItemStatus;
