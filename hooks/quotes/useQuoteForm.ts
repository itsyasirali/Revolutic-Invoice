"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { quoteEditable, LOCKED_MESSAGE } from "@/lib/editLock";
import { useParams, useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import useRouter from "@/hooks/organization/useOrgRouter";
import { invalidateQuotes } from "@/lib/swr";
import { toast } from "@/components/ui";
import useCustomerOptions from "@/hooks/common/useCustomerOptions";
import useItemsData from "@/hooks/items/useItems";
import useTemplatesList from "@/hooks/templates/useTemplatesList";
import { calculateQuoteTotals } from "@/utils/quotes/quoteCalculations";
import { toDateInput } from "@/lib/format";
import useQuote from "./useQuote";
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
  // "Clone" opens /quotes/new?clone=<id>: the source quote pre-fills a new, unsaved quote.
  const cloneId = useSearchParams()?.get("clone") || undefined;
  const isClone = !id && !!cloneId;
  const { quote, loading: quoteLoading } = useQuote(id || cloneId);
  const { options: customerOptions, customers } = useCustomerOptions();
  const { items: catalog } = useItemsData();
  const { templates } = useTemplatesList();

  // A sent quote can no longer be edited: go back to its details.
  useEffect(() => {
    if (id && quote && !quoteEditable(quote.status)) {
      toast.error(LOCKED_MESSAGE.quote, "Quote Locked");
      router.replace(`/quotes/${quote.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote?.status]);

  const [customerId, setCustomerId] = useState("");
  const [customNumbering, setCustomNumbering] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState("");
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
    if (id || isClone || !customerId) return;
    const c = customers.find((x) => String(x.id) === customerId);
    if (c?.currency) setCurrency(c.currency);
  }, [id, isClone, customerId, customers]);

  const itemOptions = useMemo(
    () =>
      catalog
        .filter((i) => (i.status || "Active") === "Active")
        .map((i) => ({ label: i.name, value: String(i.id) })),
    [catalog],
  );

  const toggleCustomNumbering = useCallback(() => {
    setCustomNumbering((prev) => {
      if (prev) setQuoteNumber("");
      return !prev;
    });
  }, []);

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

  // Shipping only applies when at least one line is goods (or a manual line with
  // no catalog item). Quotes made up solely of Service items have nothing to ship.
  const showShipping = useMemo(
    () =>
      lines.some((l) => {
        const item = l.itemId ? catalog.find((i) => String(i.id) === l.itemId) : undefined;
        return !item || item.type !== "Service";
      }),
    [lines, catalog],
  );
  const effectiveShipping = showShipping ? shipping : "0";

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
        shipping: effectiveShipping,
        adjustment,
      }),
    [lines, discountPercent, effectiveShipping, adjustment],
  );

  const [sendingAfterSave, setSendingAfterSave] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const saveQuote = useCallback(
    async (form: FormData, andSend: boolean) => {
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
        ...(customNumbering && quoteNumber.trim() ? { quoteNumber: quoteNumber.trim() } : {}),
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
        shipping: showShipping ? Number(shipping) || 0 : 0,
        adjustment: Number(adjustment) || 0,
        notes: String(form.get("notes") || ""),
        terms: String(form.get("terms") || ""),
      };

      setSaving(true);
      if (andSend) setSendingAfterSave(true);
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
        const savedId = res.data.quote.id;
        router.push(andSend ? `/quotes/${savedId}/email` : `/quotes/${savedId}`);
      } catch (err) {
        const er = err as { response?: { data?: { message?: string } }; message?: string };
        setAlert({
          show: true,
          type: "error",
          message: er.response?.data?.message || er.message || "Failed to save quote.",
        });
      } finally {
        setSaving(false);
        setSendingAfterSave(false);
      }
    },
    [
      id,
      customerId,
      customNumbering,
      quoteNumber,
      templateId,
      currency,
      lines,
      discountPercent,
      shipping,
      showShipping,
      adjustment,
      router,
    ],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await saveQuote(new FormData(e.currentTarget), false);
    },
    [saveQuote],
  );

  const handleSaveAndSend = useCallback(async () => {
    if (!formRef.current) return;
    // Not a submit button, so trigger the browser's own required-field check first.
    if (!formRef.current.reportValidity()) return;
    await saveQuote(new FormData(formRef.current), true);
  }, [saveQuote]);

  return {
    isEdit: !!id,
    isClone,
    quote,
    loading: quoteLoading,
    saving,
    customerOptions,
    selectedCustomer: customers.find((c) => String(c.id) === customerId),
    customerId, setCustomerId,
    customNumbering, toggleCustomNumbering,
    quoteNumber, setQuoteNumber,
    templateOptions, templateId, setTemplateId,
    currency, setCurrency,
    itemOptions,
    lines, updateLine, pickItem, addLine, removeLine,
    discountPercent, setDiscountPercent,
    shipping, setShipping, showShipping,
    adjustment, setAdjustment,
    totals,
    defaultQuoteDate: isClone ? "" : toDateInput(quote?.quoteDate),
    defaultExpiryDate: !isClone && quote?.expiryDate ? toDateInput(quote.expiryDate) : "",
    alert,
    dismissAlert: () => setAlert({ show: false, type: "error", message: "" }),
    formRef,
    handleSubmit,
    handleSaveAndSend,
    sendingAfterSave,
    handleCancel: () => router.push(id ? `/quotes/${id}` : "/quotes"),
  };
};

export default useQuoteForm;
