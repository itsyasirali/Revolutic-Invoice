import axios from "@/lib/axios";
import { mutate } from "swr";

export const swrFetcher = async <T = any>(url: string): Promise<T> => {
  const res = await axios.get(url);
  return res.data;
};

export const SWR_KEYS = {
  items: "/items",
  invoices: "/invoices",
  customers: "/customers",
  payments: "/payments",
  templates: "/templates",
  expenses: "/expenses",
  expenseCategories: "/expenses/categories",
  timeEntries: "/time-tracking",
  quotes: "/quotes",
  projects: "/projects",
} as const;

// Drop the cached list even when it isn't mounted (the edit/new form page),
// so the list refetches instead of showing stale data when we navigate back.
export const invalidateItems = () =>
  mutate(
    (key) => typeof key === "string" && key.startsWith(SWR_KEYS.items),
    undefined,
    { revalidate: true },
  );

export const invalidateCustomers = () => mutate(SWR_KEYS.customers);

// Invoices and payments feed each customer's remaining/received balances,
// so the cached customer list must be refreshed alongside them.
export const invalidateInvoices = () =>
  Promise.all([
    mutate(
      (key) => typeof key === "string" && key.startsWith(SWR_KEYS.invoices),
      undefined,
      { revalidate: true },
    ),
    invalidateCustomers(),
  ]);

export const invalidatePayments = () =>
  Promise.all([mutate(SWR_KEYS.payments), invalidateCustomers()]);

export const invalidateTemplates = () => mutate(SWR_KEYS.templates);

// Prefix match so list and detail (e.g. "/expenses/12") caches refresh together.
const invalidatePrefix = (prefix: string) =>
  mutate((key) => typeof key === "string" && key.startsWith(prefix), undefined, {
    revalidate: true,
  });

export const invalidateProjects = () => invalidatePrefix(SWR_KEYS.projects);

// Project totals and detail pages include time, expenses and quotes.
export const invalidateExpenses = () =>
  Promise.all([
    invalidatePrefix(SWR_KEYS.expenses),
    invalidateCustomers(),
    invalidateProjects(),
  ]);

export const invalidateExpenseCategories = () =>
  mutate(SWR_KEYS.expenseCategories);

export const invalidateTimeEntries = () =>
  Promise.all([
    invalidatePrefix(SWR_KEYS.timeEntries),
    invalidateCustomers(),
    invalidateProjects(),
  ]);

export const invalidateQuotes = () =>
  Promise.all([
    invalidatePrefix(SWR_KEYS.quotes),
    invalidateCustomers(),
    invalidateProjects(),
  ]);

// Expense/time -> invoice conversions change both sides.
export const invalidateExpensesAndInvoices = () =>
  Promise.all([invalidateExpenses(), invalidateInvoices()]);

export const invalidateTimeEntriesAndInvoices = () =>
  Promise.all([invalidateTimeEntries(), invalidateInvoices()]);

export const invalidateQuotesAndInvoices = () =>
  Promise.all([invalidateQuotes(), invalidateInvoices()]);
