import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "../../Service/axios";
import { useNavigate } from "react-router-dom";
import useInvoicesList from "../invoices/useInvoicesData";
import useCustomers from "../customers/useCustomers";
import type {
  CreatePaymentPayload,
  InvoiceDetail,
  CustomerOption,
  UseCreatePaymentReturn
} from "../../types/Payment.d";

const ELIGIBLE_INVOICE_STATUSES = new Set(["sent", "partially paid", "overdue"]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeId = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "[object Object]" ? "" : trimmed;
  }
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  if (isRecord(value)) {
    const idCandidates: Array<keyof typeof value> = ["id", "id"];
    for (const key of idCandidates) {
      if (value[key] !== undefined) {
        const nested = normalizeId(value[key]);
        if (nested) return nested;
      }
    }

    if (typeof value["$oid"] === "string" && value["$oid"].trim()) {
      return value["$oid"].trim();
    }

    if ("toHexString" in value && typeof (value as { toHexString(): string }).toHexString === "function") {
      const hex = (value as { toHexString(): string }).toHexString().trim();
      if (hex) return hex;
    }

    if ("toString" in value && typeof (value as { toString(): string }).toString === "function") {
      try {
        const asString = String((value as { toString(): string }).toString()).trim();
        if (asString && asString !== "[object Object]") {
          return asString;
        }
      } catch {
        return "";
      }
    }
  }
  return "";
};

type InvoiceDoc = Record<string, unknown>;

const toInvoiceDoc = (invoice: unknown): InvoiceDoc => {
  if (isRecord(invoice) && isRecord((invoice as Record<string, unknown>).raw)) {
    return (invoice as { raw: Record<string, unknown> }).raw;
  }
  if (isRecord(invoice)) {
    return invoice as InvoiceDoc;
  }
  return {};
};

const getInvoiceCustomerId = (invoice: unknown): string => {
  const doc = toInvoiceDoc(invoice);
  const rawCustomerId = doc["customerId"];
  const customerObj = doc["customer"] as Record<string, unknown> | undefined;
  const candidate =
    rawCustomerId ??
    customerObj?.["id"] ??
    (rawCustomerId &&
      typeof rawCustomerId === "object" &&
      rawCustomerId !== null &&
      "toString" in (rawCustomerId as Record<string, unknown>)
      ? (rawCustomerId as { toString(): string }).toString()
      : undefined);
  return normalizeId(candidate);
};

const getInvoiceStatus = (invoice: unknown): string => {
  const doc = toInvoiceDoc(invoice);
  const rawStatus = doc["status"];

  if (typeof rawStatus === "string") {
    return rawStatus.toLowerCase();
  }

  if (isRecord(rawStatus)) {
    if (typeof rawStatus.tooltip === "string") {
      return rawStatus.tooltip.toLowerCase();
    }
    if ("toString" in rawStatus && typeof (rawStatus as { toString(): string }).toString === "function") {
      return String((rawStatus as { toString(): string }).toString()).toLowerCase();
    }
  }

  if (isRecord(invoice)) {
    const statusField = (invoice as Record<string, unknown>)["status"];
    if (isRecord(statusField) && typeof statusField.tooltip === "string") {
      return statusField.tooltip.toLowerCase();
    }
  }

  return "";
};

const getInvoiceNumber = (invoice: unknown): string => {
  const doc = toInvoiceDoc(invoice);
  const rawNumber = doc["invoiceNumber"] ?? doc["invoice"] ?? doc["id"];
  return String(rawNumber ?? "—");
};

const getInvoiceDueDate = (invoice: unknown): string | undefined => {
  const doc = toInvoiceDoc(invoice);
  const rawDue = doc["dueDate"] ?? doc["invoiceDate"];
  return typeof rawDue === "string" && rawDue ? rawDue : undefined;
};

const useCreatePayment = (): UseCreatePaymentReturn => {
  const navigate = useNavigate();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [bankCharges, setBankCharges] = useState<number | "">("");
  const [amountReceived, setAmountReceived] = useState<number | "">("");
  const [paymentDate, setPaymentDate] = useState<string>(() => {
    const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    return now.toISOString().slice(0, 10);
  });
  const [paymentNumber, setPaymentNumber] = useState<number | "">("");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "Bank Transfer" | "Bank Remittance" | "Cheque" | "Other">("Cash");
  const [referenceNo, setReferenceNo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [appliedAmounts, setAppliedAmounts] = useState<Record<string, number>>({});
  const [payAllRemaining, setPayAllRemaining] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const customerIdFilter = useMemo(() => {
    if (!selectedCustomerId) return {};
    return { customerId: selectedCustomerId };
  }, [selectedCustomerId]);

  const { items: allInvoices = [] } = useInvoicesList();
  const { items: customerInvoices = [] } = useInvoicesList(customerIdFilter);
  const { customers: allCustomers = [], loading: customersLoading } = useCustomers();

  const customerList = useMemo(() => {
    return allCustomers
      .filter((customer) => customer.id) // Ensure customer has an ID
      .map((customer) => ({
        id: String(customer.id!),
        displayName: customer.displayName || customer.companyName || '',
        email: customer.contacts?.[0]?.email || customer.email,
        companyName: customer.companyName,
        currency: customer.currency,
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [allCustomers]);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customerList;
    const lowerSearch = searchTerm.toLowerCase();
    return customerList.filter(
      (customer) =>
        customer.displayName.toLowerCase().includes(lowerSearch) ||
        customer.email?.toLowerCase().includes(lowerSearch) ||
        customer.companyName?.toLowerCase().includes(lowerSearch)
    );
  }, [customerList, searchTerm]);

  const invoiceList = useMemo(() => {
    if (customerInvoices.length > 0) {
      return customerInvoices;
    }
    if (selectedCustomerId && allInvoices.length > 0) {
      return allInvoices.filter((invoice) => {
        const customerId = getInvoiceCustomerId(invoice);
        return customerId.trim() === selectedCustomerId.trim();
      });
    }
    return [];
  }, [allInvoices, customerInvoices, selectedCustomerId]);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customerList.find((customer) => customer.id === selectedCustomerId) ?? null;
  }, [customerList, selectedCustomerId]);

  useEffect(() => {
    if (!selectedCustomer) return;
    setCustomerName(selectedCustomer.displayName || "");
  }, [selectedCustomer]);

  const allCustomerInvoices = useMemo<InvoiceDetail[]>(() => {
    if (!selectedCustomerId) return [];

    return invoiceList.reduce<InvoiceDetail[]>((acc, source) => {
      const doc = toInvoiceDoc(source);
      const customerId = getInvoiceCustomerId(source);

      const normalizedCustomerId = customerId && typeof customerId === "string" ? customerId.trim() : "";
      const normalizedSelectedId = selectedCustomerId.trim();

      if (normalizedCustomerId !== normalizedSelectedId) return acc;

      const id = normalizeId(doc?.id);
      if (!id) return acc;

      const total = Number(doc["total"] ?? 0);
      const received = Number(doc["received"] ?? 0);
      const remaining = Number(doc["remaining"] ?? Math.max(total - received, 0));

      acc.push({
        id,
        number: getInvoiceNumber(source),
        total: Math.round((total + Number.EPSILON) * 100) / 100,
        received: Math.round((received + Number.EPSILON) * 100) / 100,
        remaining: Math.max(Math.round((remaining + Number.EPSILON) * 100) / 100, 0),
        status: getInvoiceStatus(source),
        dueDate: getInvoiceDueDate(source),
        currency: typeof doc["currency"] === "string" ? (doc["currency"] as string) : undefined,
      });
      return acc;
    }, []);
  }, [invoiceList, selectedCustomerId]);

  const unpaidInvoices = useMemo<InvoiceDetail[]>(() => {
    return allCustomerInvoices
      .filter((invoice) => ELIGIBLE_INVOICE_STATUSES.has(invoice.status.toLowerCase()) && invoice.remaining > 0)
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });
  }, [allCustomerInvoices]);

  const totalApplied = useMemo(() => {
    return Object.values(appliedAmounts).reduce((sum, amount) => sum + amount, 0);
  }, [appliedAmounts]);

  const amountInExcess = useMemo(() => {
    const received = typeof amountReceived === "number" ? amountReceived : 0;
    return Math.max(received - totalApplied, 0);
  }, [amountReceived, totalApplied]);

  const currency = useMemo(() => {
    if (selectedCustomer?.currency) return selectedCustomer.currency;
    if (invoiceList.length > 0) {
      const firstInvoice = toInvoiceDoc(invoiceList[0]);
      const invCurrency = typeof firstInvoice["currency"] === "string" ? firstInvoice["currency"] : undefined;
      if (invCurrency) return invCurrency;
    }
    return "PKR";
  }, [selectedCustomer, invoiceList]);

  const formatAmount = useCallback((value: number) => value.toFixed(2), []);

  const handleAppliedAmountChange = useCallback((invoiceId: string, value: string) => {
    const numValue = value === "" ? 0 : Number(value);
    setAppliedAmounts((prev) => ({
      ...prev,
      [invoiceId]: numValue,
    }));
  }, []);

  const handlePayInFull = useCallback((invoiceId: string, remaining: number) => {
    setAppliedAmounts((prev) => ({
      ...prev,
      [invoiceId]: remaining,
    }));
  }, []);

  const handleClearApplied = useCallback(() => {
    setAppliedAmounts({});
  }, []);

  const handlePayAllRemainingToggle = useCallback(() => {
    setPayAllRemaining((prev) => {
      const newValue = !prev;
      if (newValue) {
        // Calculate total remaining and auto-fill
        const totalRemaining = unpaidInvoices.reduce((sum, inv) => sum + inv.remaining, 0);
        setAmountReceived(totalRemaining);

        // Auto-fill each invoice with its remaining amount
        const newAppliedAmounts: Record<string, number> = {};
        unpaidInvoices.forEach((inv) => {
          newAppliedAmounts[inv.id] = inv.remaining;
        });
        setAppliedAmounts(newAppliedAmounts);
      } else {
        // Clear when unchecked
        setAmountReceived("");
        setAppliedAmounts({});
      }
      return newValue;
    });
  }, [unpaidInvoices]);

  const openDropdown = useCallback(() => setIsDropdownOpen(true), []);

  const closeDropdown = useCallback(() => setIsDropdownOpen(false), []);

  const handleCustomerSelect = useCallback(
    (customer: CustomerOption) => {
      setSelectedCustomerId(customer.id);
      setCustomerName(customer.displayName);
      setSearchTerm(customer.displayName);
      setAppliedAmounts({});
      closeDropdown();
    },
    [closeDropdown]
  );

  const handleCancel = useCallback(() => {
    navigate("/payments");
  }, [navigate]);

  const handleSubmit = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>, saveMode: 'draft' | 'paid' | 'send' = 'paid'): Promise<{ success: boolean; paymentId?: string; mode?: string; error?: string }> => {
      event?.preventDefault();

      if (!selectedCustomerId.trim()) {
        const errorMsg = "Please select a customer";
        setCreateError(errorMsg);
        return { success: false, error: errorMsg };
      }

      const normalizedCustomerId = selectedCustomerId.trim();
      const finalCustomerName = customerName || selectedCustomer?.displayName || "";

      if (!finalCustomerName) {
        const errorMsg = "Customer display name is missing";
        setCreateError(errorMsg);
        return { success: false, error: errorMsg };
      }

      const appliedInvoicesPayload = Object.entries(appliedAmounts)
        .filter(([, amount]) => amount > 0)
        .map(([invoiceId, amount]) => ({
          invoiceId,
          amount,
        }));

      const firstInvoiceDoc = invoiceList.length > 0 ? toInvoiceDoc(invoiceList[0]) : undefined;
      const fallbackEmail =
        firstInvoiceDoc && typeof firstInvoiceDoc["customerEmail"] === "string"
          ? (firstInvoiceDoc["customerEmail"] as string)
          : undefined;

      const payload: CreatePaymentPayload & { status?: string } = {
        paymentDate,
        paymentNumber: paymentNumber === "" ? undefined : Number(paymentNumber),
        referenceNo: referenceNo.trim() || undefined,
        customerId: normalizedCustomerId,
        customerDisplayName: finalCustomerName,
        customerEmail: selectedCustomer?.email || fallbackEmail,
        paymentMode,
        amountReceived: amountReceived === "" ? 0 : Number(amountReceived),
        bankCharges: bankCharges === "" ? 0 : Number(bankCharges),
        tdsApplied: false,
        currency,
        appliedInvoices: appliedInvoicesPayload.length > 0 ? appliedInvoicesPayload : undefined,
        status: saveMode === 'draft' ? 'Draft' : 'Paid',
      };

      const cleanedPayload = {
        paymentDate: payload.paymentDate,
        paymentNumber: payload.paymentNumber !== undefined ? Number(payload.paymentNumber) : undefined,
        referenceNo: payload.referenceNo,
        customerId: payload.customerId,
        customerDisplayName: payload.customerDisplayName,
        customerEmail: payload.customerEmail,
        paymentMode: payload.paymentMode,
        amountReceived: Number(payload.amountReceived),
        bankCharges: payload.bankCharges !== undefined ? Number(payload.bankCharges) : undefined,
        tdsApplied: payload.tdsApplied,
        currency: payload.currency,
        status: payload.status,
        appliedInvoices: payload.appliedInvoices?.map((inv) => ({
          invoiceId: inv.invoiceId,
          amount: Number(inv.amount),
        })),
      };

      try {
        setCreating(true);
        setCreateError(null);
        const response = await axios.post(`/payments`, cleanedPayload);

        const paymentId: string = String(response.data.id || response.data.payment?.id || '');

        if (saveMode === 'send') {
          // Navigate to preview for sending
          return { success: true, paymentId, mode: 'send' };
        } else {
          // Navigate back to list
          navigate("/payments");
          return { success: true, paymentId };
        }
      } catch (err: any) {
        const msg: string = String(err?.response?.data?.message || "Failed to create payment");
        setCreateError(msg);
        return { success: false, error: msg };
      } finally {
        setCreating(false);
      }
    },
    [
      amountReceived,
      appliedAmounts,
      bankCharges,
      currency,
      customerName,
      invoiceList,
      navigate,
      paymentDate,
      paymentMode,
      paymentNumber,
      referenceNo,
      selectedCustomer,
      selectedCustomerId,
    ]
  );

  return {
    amountReceived,
    setAmountReceived,
    bankCharges,
    setBankCharges,
    paymentDate,
    setPaymentDate,
    paymentNumber,
    setPaymentNumber,
    paymentMode,
    setPaymentMode,
    referenceNo,
    setReferenceNo,
    searchTerm,
    setSearchTerm,
    isDropdownOpen,
    openDropdown,
    closeDropdown,
    filteredCustomers,
    customersLoading,
    handleCustomerSelect,
    selectedCustomer,
    selectedCustomerId,
    appliedAmounts,
    handleAppliedAmountChange,
    handlePayInFull,
    handleClearApplied,
    payAllRemaining,
    handlePayAllRemainingToggle,
    unpaidInvoices,
    currency,
    totalApplied,
    amountInExcess,
    formatAmount,
    handleSubmit,
    creating,
    createError,
    handleCancel,
  };
};

export default useCreatePayment;
