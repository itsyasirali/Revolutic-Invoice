import { useCallback, useEffect, useState } from "react";
import axios from "../../Service/axios";
import type { Payment, UpdatePaymentPayload, UsePaymentsReturn } from "../../types/Payment.d";

const usePaymentsData = (): UsePaymentsReturn => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);
  const [mutateError, setMutateError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/payments`);

      if (res.status === 200) {
        const payload = Array.isArray(res.data) ? res.data : res.data?.payments ?? [];
        setPayments(payload);
      } else {
        setError("Failed to fetch payments");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePayment = useCallback(
    async (paymentId: string, payload: UpdatePaymentPayload) => {
      try {
        setMutating(true);
        setMutateError(null);

        const res = await axios.put(
          `/payments/${paymentId}`,
          payload
        );

        if (res.status === 200 && res.data?.payment) {
          setPayments((prev) =>
            prev.map((payment) => (payment.id === paymentId ? res.data.payment : payment))
          );
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Failed to update payment";
        setMutateError(msg);
        throw new Error(msg);
      } finally {
        setMutating(false);
      }
    },
    []
  );

  const deletePayments = useCallback(async (paymentIds: string[]) => {
    if (!paymentIds.length) return;
    try {
      setMutating(true);
      setMutateError(null);

      await Promise.all(
        paymentIds.map((id) =>
          axios.delete(`/payments/${id}`)
        )
      );

      setPayments((prev) => prev.filter((payment) => !paymentIds.includes(payment.id)));
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to delete payment(s)";
      setMutateError(msg);
      throw new Error(msg);
    } finally {
      setMutating(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    refetch: fetchPayments,
    updatePayment,
    deletePayments,
    mutating,
    mutateError,
  };
};

export default usePaymentsData;
