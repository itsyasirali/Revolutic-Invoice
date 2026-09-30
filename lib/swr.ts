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
} as const;

export const invalidateItems = () => mutate(SWR_KEYS.items);

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
