"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "@/lib/axios";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import { invalidateQuotes } from "@/lib/swr";
import { toast } from "@/components/ui";
import useCustomerOptions from "@/hooks/common/useCustomerOptions";
import useItemsData from "@/hooks/items/useItems";
import useTemplatesList from "@/hooks/templates/useTemplatesList";
import { calculateQuoteTotals } from "@/utils/quotes/quoteCalculations";
import { toDateInput } from "@/lib/format";
import { useQuote } from "./useQuote";
import type { QuoteItem } from "@/types/quote";

export interface FormLine {
  key: string;
  itemId: string;
  name: string;
  description: string;
  quantity: string;
  rate: string;
  discount: string;
  tax: string;
}

const newLine = (): FormLine => ({
  key: Math.random().toString(36).slice(2),
  itemId: "",
  name: "",
  description: "",
  quantity: "1",
  rate: "",
  discount: "0",
  tax: "0",
});

const fromQuoteItem = (i: QuoteItem): FormLine => ({
  key: Math.random().toString(36).slice(2),
  itemId: i.itemId ? String(i.itemId) : "",
  name: i.name,
  description: i.description || "",
  quantity: String(i.quantity),
  rate: String(i.rate),
  discount: String(i.discount ?? 0),
  tax: String(i.tax ?? 0),
});

const useQuoteForm = () => {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const { quote, loading: quoteLoading } = useQuote(id);
  const { options: customerOptions, customers } = useCustomerOptions();
  const { items: catalog } = useItemsData();
  const { templates } = useTemplatesList();

  const [customerId, setCustomerId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [currency, setCurrency] = useState("");
  const [lines, setLines] = useState<FormLine[]>([newLine()]);
  const [discountPercent, setDiscountPercent] = useState("0");
  const [shipping, setShipping] = useState("0");
  const [adjustment, setAdjustment] = useState("0");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "error" as const, message: "" });
  const [hydrated, setHydrated] = useState(false);

  // Load the quote into controlled state once (edit mode).
  useEffect(() => {
    if (!quote || hydrated) return;
    setCustomerId(String(quote.customerId));
    setTemplateId(quote.templateId ? String(quote.templateId) : "");
    setCurrency(quote.currency);
    setLines(quote.items.length ? quote.items.map(fromQuoteItem) : [newLine()]);
    setDiscountPercent(String(quote.discountPercent ?? 0));
    setShipping(String(quote.shipping ?? 0));
    setAdjustment(String(quote.adjustment ?? 0));
    setHydrated(true);
  }, [quote, hydrated]);

  // New quotes default to the customer's currency.
  useEffect(() => {
    if (id || !customerId) return;
    const c = customers.find((x) => String(x.id) === customerId);
    if (c?.currency) setCurrency(c.currency);
  }, [id, customerId, customers]);

  const itemOptions = useMemo(
    () =>
      catalog
        .filter((i) => (i.status || "Active") === "Active")
        .map((i) => ({ label: i.name, value: String(i.id) })),
    [catalog],
  );

  const templateOptions = useMemo(
    () => templates.map((t) => ({ label: t.name + (t.isDefault ? " (default)" : ""), value: String(t.id) })),
    [templates],
  );

  const updateLine = useCallback((key: string, patch: Partial<FormLine>) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }, []);

  /** Picking a catalog item snapshots its name, description and price into the line. */
  const pickItem = useCallback(
    (key: string, itemId: string) => {
      const item = catalog.find((i) => String(i.id) === itemId);
      updateLine(key, {
        itemId,
        ...(item
          ? {
              name: item.name,
              description: item.description || "",
              rate: String(item.sellingPrice ?? 0),
            }
          : {}),
      });
    },
    [catalog, updateLine],
  );

  const addLine = () => setLines((prev) => [...prev, newLine()]);
  const removeLine = (key: string) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev));

  // Preview only; the server recalculates everything on save.
  const totals = useMemo(
    () =>
      calculateQuoteTotals({
        items: lines.map((l) => ({
          name: l.name,
          quantity: l.quantity,
          rate: l.rate,
          discount: l.discount,
          tax: l.tax,
        })),
        discountPercent,
        shipping,
        adjustment,
      }),
    [lines, discountPercent, shipping, adjustment],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      if (!customerId) {
        setAlert({ show: true, type: "error", message: "Please select a customer." });
        return;
      }
      const payload = {
        customerId: Number(customerId),
        templateId: templateId ? Number(templateId) : null,
        quoteDate: String(form.get("quoteDate") || ""),
        expiryDate: String(form.get("expiryDate") || "") || null,
        currency: currency || "PKR",
        referenceNumber: String(form.get("referenceNumber") || ""),
        items: lines.map((l) => ({
          itemId: l.itemId ? Number(l.itemId) : null,
          name: l.name,
          description: l.description,
          quantity: Number(l.quantity) || 0,
          rate: Number(l.rate) || 0,
          discount: Number(l.discount) || 0,
          tax: Number(l.tax) || 0,
        })),
        discountPercent: Number(discountPercent) || 0,
        shipping: Number(shipping) || 0,
        adjustment: Number(adjustment) || 0,
        notes: String(form.get("notes") || ""),
        terms: String(form.get("terms") || ""),
      };

      setSaving(true);
      setAlert({ show: false, type: "error", message: "" });
      try {
        const res = id
          ? await axios.patch(`/quotes/${id}`, payload)
          : await axios.post("/quotes", payload);
        await invalidateQuotes();
        toast.success(
          id ? "Quote updated successfully" : "Quote created successfully",
          id ? "Quote Updated" : "Quote Created",
        );
        router.refresh();
        router.push(`/quotes/${res.data.quote.id}`);
      } catch (err) {
        const er = err as { response?: { data?: { message?: string } }; message?: string };
        setAlert({
          show: true,
          type: "error",
          message: er.response?.data?.message || er.message || "Failed to save quote.",
        });
      } finally {
        setSaving(false);
      }
    },
    [id, customerId, templateId, currency, lines, discountPercent, shipping, adjustment, router],
  );

  return {
    isEdit: !!id,
    quote,
    loading: quoteLoading,
    saving,
    customerOptions,
    customerId, setCustomerId,
    templateOptions, templateId, setTemplateId,
    currency, setCurrency,
    itemOptions,
    lines, updateLine, pickItem, addLine, removeLine,
    discountPercent, setDiscountPercent,
    shipping, setShipping,
    adjustment, setAdjustment,
    totals,
    defaultQuoteDate: toDateInput(quote?.quoteDate),
    defaultExpiryDate: quote?.expiryDate ? toDateInput(quote.expiryDate) : "",
    alert,
    dismissAlert: () => setAlert({ show: false, type: "error", message: "" }),
    handleSubmit,
    handleCancel: () => router.push(id ? `/quotes/${id}` : "/quotes"),
  };
};

export default useQuoteForm;
