"use client";

import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import axios from "@/lib/axios";
import { swrFetcher, SWR_KEYS } from "@/lib/swr";
import type { Payment, UpdatePaymentPayload, UsePaymentsReturn } from "@/types/payment";

type PaymentsApiResponse = {
  payments?: Payment[];
};

const usePaymentsData = (initialPayments?: Payment[]): UsePaymentsReturn => {
  const [mutating, setMutating] = useState(false);
  const [mutateError, setMutateError] = useState<string | null>(null);

  const {
    data,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR<PaymentsApiResponse | Payment[]>(SWR_KEYS.payments, swrFetcher, {
    fallbackData: initialPayments ? { payments: initialPayments } : undefined,
    revalidateOnFocus: true,
    revalidateOnMount: true,
  });

  const payments: Payment[] = useMemo(() => {
    if (!data) return initialPayments || [];
    return Array.isArray(data)
      ? data
      : Array.isArray(data?.payments)
        ? data.payments
        : initialPayments || [];
  }, [data, initialPayments]);

  const updatePayment = useCallback(
    async (paymentId: string, payload: UpdatePaymentPayload) => {
      try {
        setMutating(true);
        setMutateError(null);

        const res = await axios.put(`/payments/${paymentId}`, payload);

        if (res.status === 200 && res.data?.payment) {
          await mutate();
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Failed to update payment";
        setMutateError(msg);
        throw new Error(msg);
      } finally {
        setMutating(false);
      }
    },
    [mutate]
  );

  const deletePayments = useCallback(
    async (paymentIds: string[]) => {
      if (!paymentIds.length) return;
      try {
        setMutating(true);
        setMutateError(null);

        await Promise.all(
          paymentIds.map((id) => axios.delete(`/payments/${id}`))
        );

        await mutate();
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Failed to delete payment(s)";
        setMutateError(msg);
        throw new Error(msg);
      } finally {
        setMutating(false);
      }
    },
    [mutate]
  );

  return {
    payments,
    loading: isLoading,
    error: swrError
      ? swrError?.response?.data?.message ||
        swrError?.message ||
        "Failed to fetch payments"
      : null,
    refetch: async () => {
      await mutate();
    },
    updatePayment,
    deletePayments,
    mutating,
    mutateError,
  };
};

export default usePaymentsData;
