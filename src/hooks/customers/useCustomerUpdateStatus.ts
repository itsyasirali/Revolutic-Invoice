import { useState, useCallback } from 'react'
import axios from '../../Service/axios'

type AlertState = {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
};

const useUpdateCustomerStatus = () => {
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<AlertState>({ show: false, type: 'info', message: '' });

  const dismissAlert = () => {
    setAlert({ show: false, type: 'info', message: '' });
  };

  const updateStatus = useCallback(
    async (selectedIds: string[], status: string, refetch?: () => void) => {
      if (!selectedIds.length) return

      setLoading(true)
      dismissAlert();

      try {
        await axios.put(`/customers/batch-update`, {
          status,
          customers: selectedIds.map(String)
        })

        // Success alert suppressed as per user request

        if (refetch) refetch()
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        const msg = error.response?.data?.message || error.message || "Failed to update customer status";
        setAlert({
          show: true,
          type: 'error',
          message: msg
        });
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateStatus, loading, alert, dismissAlert }
}

export default useUpdateCustomerStatus
