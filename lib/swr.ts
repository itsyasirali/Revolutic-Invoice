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

export const invalidateInvoices = () =>
  mutate(
    (key) => typeof key === "string" && key.startsWith(SWR_KEYS.invoices),
    undefined,
    { revalidate: true },
  );

export const invalidateCustomers = () => mutate(SWR_KEYS.customers);

export const invalidatePayments = () => mutate(SWR_KEYS.payments);

export const invalidateTemplates = () => mutate(SWR_KEYS.templates);
