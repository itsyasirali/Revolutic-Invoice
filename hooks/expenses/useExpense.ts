"use client";

import useSWR from "swr";
import { swrFetcher, SWR_KEYS } from "@/lib/swr";
import type { Expense, ExpenseCategory } from "@/types/expense";

/** Single expense (detail/edit pages). Fresh data only, always org-scoped on the server. */
export const useExpense = (id?: string) => {
  const { data, error, isLoading, mutate } = useSWR<{ expense: Expense }>(
    id ? `${SWR_KEYS.expenses}/${id}` : null,
    swrFetcher,
    { revalidateOnFocus: true },
  );
  return {
    expense: data?.expense ?? null,
    loading: isLoading,
    notFound: !!error && !data,
    refetch: () => mutate(),
  };
};

export const useExpenseCategories = () => {
  const { data } = useSWR<{ categories: ExpenseCategory[] }>(
    SWR_KEYS.expenseCategories,
    swrFetcher,
    { revalidateOnFocus: false },
  );
  return data?.categories ?? [];
};

export default useExpense;
