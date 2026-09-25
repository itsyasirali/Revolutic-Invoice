"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import useCustomerData from "@/hooks/customers/useCustomers";
import useItemsData from "@/hooks/items/useItems";
import useCreateInvoice from "./useCreateInvoice";
import useUpdateInvoice from "./useUpdateInvoice";
import useInvoicesList from "./useInvoicesData";
import useTemplatesList from "@/hooks/templates/useTemplatesList";
import type {
  InvoiceItem,
  InvoiceFormData,
  InvoiceCustomer,
  Invoice,
} from "@/types/invoice";
import type { Item } from "@/types/item";
import type { Contact } from "@/types/customer";
import { getNavState, setNavState } from "@/lib/clientNavState";
import axios from "@/lib/axios";

export const useInvoiceForm = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isEditMode = !!id;

  const { customers, loading: customersLoading } = useCustomerData();
  const { items: itemsData, loading: itemsLoading } = useItemsData();
  const { items: invoicesList } = useInvoicesList();
  const { templates } = useTemplatesList();
  const { saveDraft, loading: saving } = useCreateInvoice();
  const { updateInvoice, loading: updating } = useUpdateInvoice();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [formPopulated, setFormPopulated] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 1,
      itemId: "",
      name: "",
      quantity: 1.0,
      unit: "",
      rate: 0.0,
      amount: 0.0,
    },
  ]);

  const [invoiceData, setInvoiceData] = useState<InvoiceFormData>({
    customerId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    terms: "Due on Receipt",
    dueDate: new Date().toISOString().split("T")[0],
    notes: "",
    currency: "PKR",
    recipients: [],
    discountPercent: 0,
    templateId: "",
  });

  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [itemDropdownOpen, setItemDropdownOpen] = useState<{
    [key: number]: boolean;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [includePreviousRemaining, setIncludePreviousRemaining] = useState(true);
  // Off (default) = server assigns the general organization-wide sequence
  // (INV-0001, INV-0002, ...). On = a per-customer number like "Ahmad-1",
  // "Ahmad-2" is suggested instead, still editable before saving.
  const [customNumbering, setCustomNumbering] = useState(false);

  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const itemDropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const selectedCustomer = customers.find(
    (c) => String(c.id) === String(invoiceData.customerId)
  );

  const lastProcessedCustomerId = useRef<string>("");

  // Preview of the next general auto-generated invoice number, computed the
  // same way as the server (createInvoice.ts) so it can be shown to the
  // user before they've actually saved anything.
  const previewInvoiceNumber = useMemo(() => {
    let maxSeq = 0;
    invoicesList.forEach((inv) => {
      const raw = inv?.raw || inv;
      const num = String(raw?.invoiceNumber || "");
      const match = num.match(/(\d+)\s*$/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq;
      }
    });
    return `INV-${String(maxSeq + 1).padStart(4, "0")}`;
  }, [invoicesList]);

  const customerInvoices = useMemo(() => {
    const customerIdStr = String(invoiceData.customerId || "");
    if (!customerIdStr) return [];

    const filtered = invoicesList.filter((inv) => {
      const raw = inv?.raw || inv;
      const cid = String(raw?.customerId || raw?.customer?.id || "");
      return cid === customerIdStr;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(
        a.raw?.createdAt || 0
      ).getTime();
      const dateB = new Date(
        b.raw?.createdAt || 0
      ).getTime();
      return dateB - dateA;
    });
  }, [invoiceData.customerId, invoicesList]);

  useEffect(() => {
    const customerIdStr = String(invoiceData.customerId || "");

    const shouldAutoSelectTemplate =
      !isEditMode &&
      (customerIdStr !== lastProcessedCustomerId.current ||
        !invoiceData.templateId);

    if (shouldAutoSelectTemplate) {
      let targetTemplateId = "";
      if (customerIdStr && customerInvoices.length > 0) {
        const lastInvoice = customerInvoices[0]?.raw || customerInvoices[0];
        const rawTemplateId = (lastInvoice as { templateId?: string | { id?: string } })?.templateId;
        if (rawTemplateId) {
          targetTemplateId =
            typeof rawTemplateId === "object"
              ? String(rawTemplateId.id || "")
              : String(rawTemplateId);
        }
      }

      if (!targetTemplateId && templates.length > 0) {
        const defaultTemplate =
          templates.find((t) => t.isDefault) || templates[0];
        targetTemplateId = defaultTemplate?.id || "";
      }

      if (targetTemplateId && targetTemplateId !== invoiceData.templateId) {
        queueMicrotask(() => {
          setInvoiceData((prev) => ({
            ...prev,
            templateId: targetTemplateId,
          }));
        });
      }
    }

    lastProcessedCustomerId.current = customerIdStr;
  }, [
    invoiceData.customerId,
    customerInvoices,
    templates,
    isEditMode,
    invoiceData.templateId,
  ]);

  const namePopulatedRef = useRef(false);

  useEffect(() => {
    if (
      isEditMode &&
      !namePopulatedRef.current &&
      invoiceData.customerId &&
      !customersLoading &&
      customers.length > 0
    ) {
      const found = customers.find(
        (c) => String(c.id) === String(invoiceData.customerId)
      );
      if (found) {
        const name = found.displayName || found.companyName || "";
        if (name) {
          queueMicrotask(() => {
            setCustomerSearchTerm(name);
            namePopulatedRef.current = true;
          });
        }
      }
    }
  }, [customers, customersLoading, isEditMode, invoiceData.customerId]);

  useEffect(() => {
    if (isEditMode && id) {
      setFormPopulated(false);
      namePopulatedRef.current = false;
      setInvoiceError(null);

      const navInvoice = getNavState<Invoice>(`invoice:${id}`);
      if (navInvoice) {
        setInvoice(
          ((navInvoice as unknown as { raw?: Invoice }).raw ?? navInvoice) as Invoice
        );
        return;
      }

      const foundInvoice = invoicesList.find(
        (inv) => String(inv.id) === String(id)
      );
      if (foundInvoice && foundInvoice.raw) {
        setInvoice(foundInvoice.raw);
        return;
      }

      // Neither the nav state nor the already-fetched invoices list has
      // this invoice (e.g. a hard refresh or a direct link to the edit
      // page) — fall back to fetching it directly from the API by id.
      let cancelled = false;
      setInvoiceLoading(true);
      axios
        .get(`/invoices/${id}`)
        .then((res) => {
          if (cancelled) return;
          const fetched = res.data?.invoice || res.data;
          if (fetched) {
            setInvoice(fetched as Invoice);
          } else {
            setInvoiceError("Invoice not found.");
          }
        })
        .catch((err) => {
          if (cancelled) return;
          console.error("Failed to fetch invoice:", err);
          const status = err?.response?.status;
          setInvoiceError(
            status === 404
              ? "Invoice not found."
              : err?.response?.data?.message || "Failed to load invoice."
          );
        })
        .finally(() => {
          if (!cancelled) setInvoiceLoading(false);
        });

      return () => {
        cancelled = true;
      };
    } else {
      setInvoice(null);
      setFormPopulated(false);
      setInvoiceLoading(false);
      setInvoiceError(null);
    }
  }, [id, isEditMode, invoicesList]);

  useEffect(() => {
    if (invoice && isEditMode && !formPopulated) {
      queueMicrotask(() => {
        const formatDate = (date: string | Date | undefined): string => {
          if (!date) return "";
          const d = new Date(date);
          if (isNaN(d.getTime())) return "";
          return d.toISOString().split("T")[0];
        };

        const invoiceDateStr = invoice.invoiceDate;
        const dueDateStr = invoice.dueDate;
        if (!invoiceDateStr || !dueDateStr) {
          return;
        }
        const invoiceDate = new Date(invoiceDateStr);
        const dueDate = new Date(dueDateStr);
        if (isNaN(invoiceDate.getTime()) || isNaN(dueDate.getTime())) {
          return;
        }
        const daysDiff = Math.floor(
          (dueDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        let terms = "Due on Receipt";
        if (daysDiff === 15) terms = "Net 15";
        else if (daysDiff === 30) terms = "Net 30";
        else if (daysDiff === 60) terms = "Net 60";

        const customerObj =
          typeof invoice.customerId === "object" && invoice.customerId !== null
            ? invoice.customerId
            : null;
        const customerIdValue = customerObj
          ? String(customerObj.id || "")
          : String(invoice.customerId || "");
        const customerNameVal =
          invoice.customerDisplayName ||
          customerObj?.displayName ||
          customerObj?.companyName ||
          "";

        const templateObj =
          typeof invoice.templateId === "object" && invoice.templateId !== null
            ? invoice.templateId
            : null;
        const templateIdValue = templateObj
          ? String(templateObj.id || "")
          : String(invoice.templateId || "");

        setInvoiceData({
          customerId: customerIdValue,
          customerName: customerNameVal,
          customerEmail: invoice.customerEmail || "",
          customerPhone: invoice.customerPhone || "",
          customerAddress: invoice.customerAddress || "",
          invoiceNumber: invoice.invoiceNumber || "",
          invoiceDate: formatDate(invoiceDateStr),
          terms: terms,
          dueDate: formatDate(dueDateStr),
          notes: typeof invoice.notes === "string" ? invoice.notes : "",
          currency: invoice.currency || "PKR",
          recipients: invoice.recipients || [],
          discountPercent: invoice.discountPercent || 0,
          templateId: templateIdValue,
        });

        setCustomerSearchTerm(customerNameVal);
        if (customerNameVal) {
          namePopulatedRef.current = true;
        }

        if (
          invoice.items &&
          Array.isArray(invoice.items) &&
          invoice.items.length > 0
        ) {
          const mappedItems: InvoiceItem[] = invoice.items.map(
            (item, index: number) => {
              let unit = "";
              const rawItemId = item.itemId;
              const isObjectItem = typeof rawItemId === "object" && rawItemId !== null;
              const itemIdStr = isObjectItem
                ? String(rawItemId.id ?? "")
                : String(rawItemId || "");

              if (itemIdStr) {
                const foundItem = itemsData.find(
                  (it) => String(it.id) === itemIdStr
                );
                unit = foundItem?.unit || "";
              } else if (isObjectItem && rawItemId.unit) {
                unit = String(rawItemId.unit);
              }

              if (!unit && item.unit) {
                unit = item.unit;
              }

              return {
                id: index + 1,
                itemId: itemIdStr,
                name:
                  item.title ||
                  item.name ||
                  (isObjectItem ? String(rawItemId.name || "") : ""),
                description: item.description || "",
                quantity: Number(item.quantity) || 1,
                unit: unit,
                rate: Number(item.rate) || 0,
                amount: Number(item.amount) || 0,
              };
            }
          );
          setItems(mappedItems);
        }
        setFormPopulated(true);
      });
    }
  }, [invoice, isEditMode, formPopulated, itemsData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target as Node)
      ) {
        setCustomerDropdownOpen(false);
      }
      Object.keys(itemDropdownRefs.current).forEach((key) => {
        const ref = itemDropdownRefs.current[Number(key)];
        if (ref && !ref.contains(event.target as Node)) {
          setItemDropdownOpen((prev) => ({ ...prev, [Number(key)]: false }));
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculateAmount = (quantity: number, rate: number): number => {
    return quantity * rate;
  };

  const calculateSubtotal = (): number => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const getPreviousRemainingBase = (): number => {
    if (
      isEditMode &&
      invoice &&
      String(
        typeof invoice.customerId === "object" && invoice.customerId !== null
          ? invoice.customerId.id
          : invoice.customerId
      ) === String(invoiceData.customerId)
    ) {
      return invoice.previousRemaining || 0;
    }
    return selectedCustomer?.receivables || 0;
  };

  const getPreviousRemainingAmount = (): number =>
    includePreviousRemaining ? getPreviousRemainingBase() : 0;

  const calculateTotal = (): number => {
    const subTotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discountPercent = Number(invoiceData.discountPercent) || 0;
    const discountAmount = (subTotal * discountPercent) / 100;
    return subTotal - discountAmount + getPreviousRemainingAmount();
  };

  const calculateDueDate = (terms: string, invoiceDate: string): string => {
    const date = new Date(invoiceDate);
    if (isNaN(date.getTime())) return invoiceDate;

    if (terms === "Due on Receipt") {
      return invoiceDate;
    } else if (terms === "Net 15") {
      date.setDate(date.getDate() + 15);
    } else if (terms === "Net 30") {
      date.setDate(date.getDate() + 30);
    } else if (terms === "Net 45") {
      date.setDate(date.getDate() + 45);
    } else if (terms === "Net 60") {
      date.setDate(date.getDate() + 60);
    } else if (terms === "Due end of the month") {
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return endOfMonth.toISOString().split("T")[0];
    } else if (terms === "Due end of next month") {
      const endOfNextMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0);
      return endOfNextMonth.toISOString().split("T")[0];
    }
    return date.toISOString().split("T")[0];
  };

  const numberingKeyRef = useRef("");

  useEffect(() => {
    if (isEditMode || !invoiceData.customerId) return;
    const key = `${invoiceData.customerId}:${customNumbering}`;
    if (numberingKeyRef.current === key) return;
    numberingKeyRef.current = key;

    if (customNumbering) {
      const base =
        invoiceData.customerName ||
        selectedCustomer?.displayName ||
        selectedCustomer?.companyName ||
        "Customer";
      const nextSeq = customerInvoices.length + 1;
      setInvoiceData((prev) => ({
        ...prev,
        invoiceNumber: `${base}-${nextSeq}`,
      }));
    } else {
      setInvoiceData((prev) => ({ ...prev, invoiceNumber: "" }));
    }
  }, [
    invoiceData.customerId,
    invoiceData.customerName,
    customNumbering,
    customerInvoices,
    selectedCustomer,
    isEditMode,
  ]);

  const toggleCustomNumbering = () => {
    numberingKeyRef.current = "";
    setCustomNumbering((prev) => !prev);
  };

  const selectCustomer = (customer: InvoiceCustomer) => {
    setInvoiceData((prev) => ({
      ...prev,
      customerId: String(customer.id),
      customerName: customer.displayName || customer.companyName || "",
      customerEmail: customer.contacts?.[0]?.email || "",
      customerPhone: customer.contacts?.[0]?.contact || "",
      customerAddress: customer.address || "",
      currency: customer.currency || prev.currency || "PKR",
      recipients: [],
    }));
    setCustomerSearchTerm(customer.displayName || customer.companyName || "");
    setCustomerDropdownOpen(false);
  };

  const selectItem = (itemId: number, item: Item) => {
    setItems((prevItems) =>
      prevItems.map((invItem) => {
        if (invItem.id === itemId) {
          return {
            ...invItem,
            itemId: String(item.id),
            name: item.name || "",
            description: item.description || "",
            unit: item.unit || "",
            rate: item.sellingPrice || 0,
            amount: calculateAmount(invItem.quantity, item.sellingPrice || 0),
          };
        }
        return invItem;
      })
    );
    setItemDropdownOpen((prev) => ({ ...prev, [itemId]: false }));
  };

  const updateItem = (
    id: number,
    field: keyof InvoiceItem,
    value: string | number
  ): void => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem: InvoiceItem = {
            ...item,
            [field]: value,
          } as InvoiceItem;
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = calculateAmount(
              updatedItem.quantity,
              updatedItem.rate
            );
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const addNewRow = (): void => {
    setItems((prev) => [
      ...prev,
      {
        id: prev.length > 0 ? Math.max(...prev.map((i) => i.id)) + 1 : 1,
        itemId: "",
        name: "",
        quantity: 1.0,
        unit: "",
        rate: 0.0,
        amount: 0.0,
      },
    ]);
  };

  const deleteItem = (id: number): void => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleInvoiceChange = (
    field: keyof InvoiceFormData,
    value: string | string[]
  ): void => {
    setInvoiceData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "invoiceDate") {
        updated.dueDate = calculateDueDate(prev.terms, value as string);
      }
      return updated;
    });
  };

  const handleTermsChange = (terms: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      terms,
      dueDate: calculateDueDate(terms, prev.invoiceDate),
    }));
  };

  const handleSaveDraft = async () => {
    const payload = {
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      dueDate: invoiceData.dueDate,
      customerId: invoiceData.customerId,
      customerDisplayName: invoiceData.customerName,
      customerEmail: invoiceData.customerEmail,
      customerPhone: invoiceData.customerPhone,
      customerAddress: invoiceData.customerAddress,
      currency: invoiceData.currency,
      items: items.map((item) => ({
        itemId: item.itemId,
        title: item.name,
        description: item.description || "",
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      })),
      subTotal: calculateSubtotal(),
      taxPercent: 0,
      discountPercent: Number(invoiceData.discountPercent) || 0,
      shipping: 0,
      total: calculateTotal(),
      templateId: invoiceData.templateId,
      notes: invoiceData.notes,
      recipients: invoiceData.recipients,
      previousRemaining: getPreviousRemainingAmount(),
    };

    if (isEditMode && id) {
      const result = await updateInvoice(id, payload);
      if (result) {
        router.refresh();
        router.push("/invoices");
      }
    } else {
      const result = await saveDraft(payload);
      if (result) {
        router.refresh();
        router.push("/invoices");
      }
    }
  };

  const handlePreview = () => {
    const payload = {
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      dueDate: invoiceData.dueDate,
      customerId: invoiceData.customerId,
      customerDisplayName: invoiceData.customerName,
      customerEmail: invoiceData.customerEmail,
      customerPhone: invoiceData.customerPhone,
      customerAddress: invoiceData.customerAddress,
      currency: invoiceData.currency,
      items: items.map((item) => ({
        itemId: item.itemId,
        title: item.name,
        description: item.description || "",
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      })),
      subTotal: calculateSubtotal(),
      taxPercent: 0,
      discountPercent: Number(invoiceData.discountPercent) || 0,
      shipping: 0,
      total: calculateTotal(),
      template:
        templates.find(
          (t) => String(t.id) === String(invoiceData.templateId)
        )?.raw ||
        templates.find(
          (t) => String(t.id) === String(invoiceData.templateId)
        ) ||
        undefined,
      templateId: invoiceData.templateId,
      notes: invoiceData.notes,
      recipients:
        selectedCustomer?.contacts
          ?.map((contact: Contact) => contact.email || "")
          .filter((email: string) => !!email) || [],
      previousRemaining: getPreviousRemainingAmount(),
      status: isEditMode && invoice ? invoice.status : "Draft",
    };

    const previewId = isEditMode && id ? id : "draft";
    setNavState(`invoice:${previewId}`, payload);
    router.push(`/invoices/preview/${previewId}`);
  };

  const handleSaveAndSend = async () => {
    if (isSubmitting || saving || updating) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate,
        customerId: invoiceData.customerId,
        customerDisplayName: invoiceData.customerName,
        customerEmail: invoiceData.customerEmail,
        customerPhone: invoiceData.customerPhone,
        customerAddress: invoiceData.customerAddress,
        currency: invoiceData.currency,
        items: items.map((item) => ({
          itemId: item.itemId,
          title: item.name,
          description: item.description || "",
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })),
        subTotal: calculateSubtotal(),
        taxPercent: 0,
        discountPercent: Number(invoiceData.discountPercent) || 0,
        shipping: 0,
        total: calculateTotal(),
        templateId: invoiceData.templateId,
        notes: invoiceData.notes,
        recipients:
          selectedCustomer?.contacts
            ?.map((contact: Contact) => contact.email || "")
            .filter((email: string) => !!email) || [],
        previousRemaining: getPreviousRemainingAmount(),
      };

      let invoiceId = id;

      if (isEditMode && id) {
        const result = await updateInvoice(id, payload);
        if (!result) {
          setIsSubmitting(false);
          return;
        }
        invoiceId = id;
      } else {
        const result = await saveDraft(payload);
        if (!result || !result.id) {
          setIsSubmitting(false);
          return;
        }
        invoiceId = result.id;
      }

      if (invoiceId) {
        const currentStatus = invoice?.status || "Draft";
        const preserveStatus =
          isEditMode &&
          invoice &&
          ["Sent", "Partially Paid", "Paid"].includes(currentStatus);

        const finalStatus = preserveStatus ? currentStatus : "Draft";
        const finalReceived = preserveStatus ? invoice.received || 0 : 0;
        const finalRemaining = calculateTotal() - finalReceived;

        const navPayload = {
          ...payload,
          id: invoiceId,
          items: items,
          subTotal: calculateSubtotal(),
          total: calculateTotal(),
          received: finalReceived,
          remaining: finalRemaining,
          previousRemaining: getPreviousRemainingAmount(),
          status: finalStatus,
          discountPercent: Number(invoiceData.discountPercent) || 0,
          templateId: invoiceData.templateId,
          template:
            templates.find(
              (t) => String(t.id) === String(invoiceData.templateId)
            )?.raw ||
            templates.find(
              (t) => String(t.id) === String(invoiceData.templateId)
            ) ||
            undefined,
        };

        setNavState(`invoice:${invoiceId}`, navPayload);
        router.push(`/invoices/preview/${invoiceId}`);
      }
    } catch (error) {
      console.error("Error in handleSaveAndSend:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/invoices");
  };

  const openTemplateSelector = () => setShowTemplateSelector(true);
  const closeTemplateSelector = () => setShowTemplateSelector(false);

  const busy = isSubmitting || saving || updating;

  const isFormValid = !!(
    invoiceData.customerId &&
    items.length > 0 &&
    items.some((item) => item.name && item.name.trim() !== "")
  );

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = customerSearchTerm.toLowerCase();
    const displayName = (
      customer.displayName ||
      customer.companyName ||
      ""
    ).toLowerCase();
    const email = (customer.contacts?.[0]?.email || "").toLowerCase();
    return displayName.includes(searchLower) || email.includes(searchLower);
  });

  return {
    isEditMode,
    items,
    invoiceData,
    invoice,
    invoiceLoading,
    invoiceError,
    customerDropdownOpen,
    customerSearchTerm,
    itemDropdownOpen,
    isSubmitting,
    customerInvoices,
    selectedCustomer,
    filteredCustomers,
    customerDropdownRef,
    itemDropdownRefs,
    customersLoading,
    itemsLoading,
    saving,
    updating,
    customers,
    itemsData,
    showTemplateSelector,
    openTemplateSelector,
    closeTemplateSelector,
    busy,
    isFormValid,
    setCustomerDropdownOpen,
    setCustomerSearchTerm,
    setItemDropdownOpen,
    selectCustomer,
    selectItem,
    updateItem,
    addNewRow,
    deleteItem,
    handleInvoiceChange,
    handleTermsChange,
    handleSaveDraft,
    handleSaveAndSend,
    handlePreview,
    handleCancel,
    calculateTotal,
    calculateSubtotal,
    includePreviousRemaining,
    setIncludePreviousRemaining,
    getPreviousRemainingBase,
    customNumbering,
    toggleCustomNumbering,
    previewInvoiceNumber,
  };
};

export default useInvoiceForm;
