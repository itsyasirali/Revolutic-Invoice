"use client";

import { useMemo } from "react";
import useRecords from "@/hooks/common/useRecords";
import { SWR_KEYS } from "@/lib/swr";
import type { Quote } from "@/types/quote";
import type { Expense } from "@/types/expense";
import type { TimeEntry } from "@/types/timeEntry";

/**
 * Quotes, expenses and time entries of one customer. Reads the same cached,
 * organization-scoped lists as the module pages and filters by customer.
 */
export const useCustomerRelatedRecords = (customerId?: number | string | null) => {
  const id = customerId ? Number(customerId) : null;
  const quotes = useRecords<Quote>(SWR_KEYS.quotes, "quotes");
  const expenses = useRecords<Expense>(SWR_KEYS.expenses, "expenses");
  const timeEntries = useRecords<TimeEntry>(SWR_KEYS.timeEntries, "timeEntries");

  return useMemo(
    () => ({
      quotes: id ? quotes.records.filter((q) => q.customerId === id) : [],
      expenses: id ? expenses.records.filter((e) => e.customerId === id) : [],
      timeEntries: id ? timeEntries.records.filter((t) => t.customerId === id) : [],
    }),
    [id, quotes.records, expenses.records, timeEntries.records],
  );
};

export type CustomerRelatedRecords = ReturnType<typeof useCustomerRelatedRecords>;

export default useCustomerRelatedRecords;
