"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import axios from "@/lib/axios";
import { invalidatePayments } from "@/lib/swr";
import useCustomers from "@/hooks/customers/useCustomers";
import usePaymentActions from "./usePaymentActions";
import type {
  PaymentFormData,
  UsePaymentFormReturn,
  CustomerOption,
} from "@/types/payment";
import { getNavState } from "@/lib/clientNavState";
import { toast } from "@/components/ui";

export const usePaymentForm = (): UsePaymentFormReturn => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const isEditMode = Boolean(id);

  const { customers, loading: customersLoading } = useCustomers();
  const { handlePreview } = usePaymentActions();

  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    customerId: "",
    customerName: "",
    customerEmail: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "Cash",
    referenceNo: "",
    amountReceived: "",
    bankCharges: "",
    currency: "PKR",
  });

  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [selectedCustomerData, setSelectedCustomerData] = useState<any>(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [appliedAmounts, setAppliedAmounts] = useState<Record<string, number>>(
    {}
  );
  const [payAllRemaining, setPayAllRemaining] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Amounts this payment already applied to each invoice (edit mode only).
  const originalAppliedRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const navPayment = id ? getNavState<any>(`payment:${id}`) : null;
    const paymentSource = navPayment;

    if (paymentSource) {
      setPaymentData({
        customerId:
          paymentSource.customerId ||
          paymentSource.customer?.id ||
          "",
        customerName:
          paymentSource.customerDisplayName ||
          paymentSource.customer?.displayName ||
          paymentSource.customer?.companyName ||
          "",
        customerEmail:
          paymentSource.customerEmail || paymentSource.customer?.email || "",
        paymentDate: paymentSource.paymentDate
          ? new Date(paymentSource.paymentDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        paymentMode: paymentSource.paymentMode || "Cash",
        referenceNo: paymentSource.referenceNo || "",
        amountReceived: paymentSource.amountReceived || "",
        bankCharges: paymentSource.bankCharges || "",
        currency: paymentSource.currency || "PKR",
      });

      if (Array.isArray(paymentSource.appliedInvoices)) {
        const existing: Record<string, number> = {};
        paymentSource.appliedInvoices.forEach((a: any) => {
          const invId = a?.invoiceId ?? a?.invoice?.id;
          if (invId != null) existing[String(invId)] = Number(a.amount) || 0;
        });
        originalAppliedRef.current = existing;
        setAppliedAmounts(existing);
      }

      if (paymentSource.customer) {
        setSelectedCustomerData(paymentSource.customer);
        setCustomerSearchTerm(
          paymentSource.customerDisplayName ||
            paymentSource.customer?.displayName ||
            paymentSource.customer?.companyName ||
            ""
        );
      }
    }
  }, [id]);

  useEffect(() => {
    if (!paymentData.customerId) {
      setUnpaidInvoices([]);
      return;
    }

    const fetchUnpaidInvoices = async () => {
      try {
        const response = await axios.get(
          `/invoices?customerId=${paymentData.customerId}`
        );
        const invoices = response.data.invoices || response.data || [];

        const eligible = invoices
          .filter((inv: any) => {
            const status = (inv.status || "").toLowerCase();
            // `remaining` can still be at its 0 default on invoices that were
            // never paid, so derive it from total - received in that case.
            const storedRemaining = Number(inv.remaining || 0);
            let remaining =
              storedRemaining > 0 || status === "paid"
                ? storedRemaining
                : Math.max(
                    0,
                    Number(inv.total || 0) - Number(inv.received || 0),
                  );
            // The invoice's stored balance already has this payment taken
            // off it; add it back so the balance shown is what was open
            // before this payment.
            const alreadyApplied = originalAppliedRef.current[String(inv.id)] || 0;
            if (alreadyApplied > 0) {
              remaining = Math.min(
                Number(inv.total || 0),
                remaining + alreadyApplied,
              );
            }
            inv.remaining = remaining;
            const validStatus = [
              "sent",
              "partially paid",
              "overdue",
              "viewed",
              "paid",
            ].includes(status);
            return validStatus && remaining > 0;
          })
          .map((inv: any) => ({
            ...inv,
            remaining: Number(inv.remaining || 0),
            total: Number(inv.total || 0),
            amount: Number(inv.amount || 0),
          }));
        setUnpaidInvoices(eligible);
      } catch (error) {
        console.error("Error fetching unpaid invoices:", error);
        setUnpaidInvoices([]);
      }
    };

    fetchUnpaidInvoices();
  }, [paymentData.customerId]);

  const selectCustomer = (customer: any) => {
    const cId = customer.id;

    setPaymentData((prev) => ({
      ...prev,
      customerId: cId,
      customerName: customer.displayName || customer.companyName || "",
      customerEmail: customer.contacts?.[0]?.email || customer.email || "",
      currency: customer.currency || prev.currency || "PKR",
    }));
    setSelectedCustomerData(customer);
    setCustomerSearchTerm(customer.displayName || customer.companyName || "");
    setCustomerDropdownOpen(false);
    setAppliedAmounts({});
    setPayAllRemaining(false);
  };

  const autoAllocate = (totalAmount: number) => {
    let remainingToAllocate = totalAmount;
    const newAppliedAmounts: Record<string, number> = {};
    unpaidInvoices.forEach((inv) => {
      if (remainingToAllocate <= 0) {
        newAppliedAmounts[inv.id] = 0;
        return;
      }
      const invRemaining = inv.remaining || 0;
      const applied = Math.min(invRemaining, remainingToAllocate);
      newAppliedAmounts[inv.id] = applied;
      remainingToAllocate -= applied;
    });
    setAppliedAmounts(newAppliedAmounts);
  };

  const handleAmountReceivedChange = (value: string) => {
    setPayAllRemaining(false);
    setPaymentData((prev) => ({
      ...prev,
      amountReceived: (value === "" ? "" : Number(value)) as unknown as number,
    }));
    autoAllocate(value === "" ? 0 : Number(value));
  };

  const handlePayAllRemainingToggle = () => {
    setPayAllRemaining((prev) => {
      const newValue = !prev;
      if (newValue) {
        const totalRemaining = unpaidInvoices.reduce(
          (sum, inv) => sum + (inv.remaining || 0),
          0
        );
        setPaymentData((prevData) => ({
          ...prevData,
          amountReceived: totalRemaining,
        }));

        const newAppliedAmounts: Record<string, number> = {};
        unpaidInvoices.forEach((inv) => {
          newAppliedAmounts[inv.id] = inv.remaining || 0;
        });
        setAppliedAmounts(newAppliedAmounts);
      } else {
        setPaymentData((prevData) => ({ ...prevData, amountReceived: "" }));
        setAppliedAmounts({});
      }
      return newValue;
    });
  };

  const handleAppliedAmountChange = (invoiceId: string, value: string) => {
    const numValue = value === "" ? 0 : Number(value);
    setAppliedAmounts((prev) => ({
      ...prev,
      [invoiceId]: numValue,
    }));
  };

  const handlePayInFull = (invoiceId: string, remaining: number) => {
    setAppliedAmounts((prev) => ({
      ...prev,
      [invoiceId]: remaining,
    }));
  };

  const totalApplied = Object.values(appliedAmounts).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const amountInExcess = Math.max(
    (typeof paymentData.amountReceived === "number"
      ? paymentData.amountReceived
      : 0) - totalApplied,
    0
  );

  const filteredCustomers: CustomerOption[] = customers
    .filter((customer) => {
      const isInactive =
        String(customer.status || "").toLowerCase() === "inactive";
      if (isInactive && String(customer.id) !== String(paymentData.customerId)) {
        return false;
      }
      const searchLower = customerSearchTerm.toLowerCase();
      const displayName = (
        customer.displayName ||
        customer.companyName ||
        ""
      ).toLowerCase();
      const email = (customer.contacts?.[0]?.email || "").toLowerCase();
      const companyName = (customer.companyName || "").toLowerCase();
      return (
        displayName.includes(searchLower) ||
        email.includes(searchLower) ||
        companyName.includes(searchLower)
      );
    })
    .map((customer) => ({ ...customer, id: String(customer.id) }));

  const getAmountError = (): string | null => {
    const received =
      typeof paymentData.amountReceived === "number"
        ? paymentData.amountReceived
        : 0;
    if (!Number.isFinite(received) || received <= 0) {
      return "Amount received must be greater than zero";
    }
    // Allocation can't be changed when editing; the server checks the amount
    // against what is already applied.
    if (isEditMode) return null;
    for (const [invoiceId, amount] of Object.entries(appliedAmounts)) {
      if (!(amount > 0)) continue;
      const inv = unpaidInvoices.find(
        (i) => String(i.id) === String(invoiceId)
      );
      const remaining = Number(inv?.remaining || 0);
      if (inv && amount > remaining) {
        return `Amount applied to ${inv.invoiceNumber} exceeds its remaining balance of ${remaining.toFixed(2)}`;
      }
    }
    if (totalApplied > received) {
      return `Total applied amount (${totalApplied.toFixed(2)}) exceeds the amount received (${received.toFixed(2)})`;
    }
    if (
      (unpaidInvoices.length > 0 || totalApplied > 0) &&
      Number((received - totalApplied).toFixed(2)) > 0
    ) {
      return `Amount received (${received.toFixed(2)}) exceeds the amount applied to invoices (${totalApplied.toFixed(2)}). Reduce the amount received to match the invoice balance.`;
    }
    return null;
  };

  const handleSaveDraft = async () => {
    if (isSaving || isSubmitting) return;
    const amountError = getAmountError();
    if (amountError) {
      toast.error(amountError, "Invalid Amount");
      return;
    }

    setIsSaving(true);
    try {
      const appliedInvoicesPayload = Object.entries(appliedAmounts)
        .filter(([, amount]) => amount > 0)
        .map(([invoiceId, amount]) => ({
          invoiceId,
          amount: Number(amount),
        }));

      const payload = {
        paymentDate: paymentData.paymentDate,
        referenceNo: paymentData.referenceNo || undefined,
        customerId: paymentData.customerId,
        customerDisplayName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        paymentMode: paymentData.paymentMode,
        amountReceived:
          typeof paymentData.amountReceived === "number"
            ? paymentData.amountReceived
            : 0,
        bankCharges:
          typeof paymentData.bankCharges === "number"
            ? paymentData.bankCharges
            : 0,
        currency: paymentData.currency,
        status: "Draft" as const,
        appliedInvoices:
          appliedInvoicesPayload.length > 0 ? appliedInvoicesPayload : undefined,
      };

      if (isEditMode && id) {
        await axios.put(`/payments/${id}`, payload);
        await invalidatePayments();
        toast.success("Payment updated successfully", "Payment Updated");
        router.refresh();
        router.push(`/payments/${id}`);
      } else {
        const response = await axios.post(`/payments`, payload);
        if (response.data) {
          await invalidatePayments();
          toast.success("Payment draft saved successfully", "Draft Saved");
          router.refresh();
          router.push("/payments");
        }
      }
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast.error(error.response?.data?.message || "Failed to save draft", "Error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndSend = async () => {
    if (isSubmitting || isSaving) return;
    const amountError = getAmountError();
    if (amountError) {
      toast.error(amountError, "Invalid Amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const appliedInvoicesPayload = Object.entries(appliedAmounts)
        .filter(([, amount]) => amount > 0)
        .map(([invoiceId, amount]) => {
          const invoice = unpaidInvoices.find(
            (inv) => String(inv.id) === String(invoiceId)
          );
          return {
            invoiceId,
            amount: Number(amount),
            invoiceNumber: invoice?.invoiceNumber,
            invoiceAmount: invoice?.total,
          };
        });

      const payload = {
        paymentDate: paymentData.paymentDate,
        referenceNo: paymentData.referenceNo || undefined,
        customerId: paymentData.customerId,
        customerDisplayName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        paymentMode: paymentData.paymentMode,
        amountReceived:
          typeof paymentData.amountReceived === "number"
            ? paymentData.amountReceived
            : 0,
        bankCharges:
          typeof paymentData.bankCharges === "number"
            ? paymentData.bankCharges
            : 0,
        currency: paymentData.currency,
        status: "Paid" as const,
        appliedInvoices:
          appliedInvoicesPayload.length > 0 ? appliedInvoicesPayload : undefined,
      };

      let paymentId = id;

      if (isEditMode && id) {
        await axios.put(`/payments/${id}`, payload);
        await invalidatePayments();
        toast.success("Payment updated successfully", "Payment Updated");
      } else {
        const response = await axios.post(`/payments`, payload);
        paymentId =
          response.data.id || response.data.payment?.id;
        await invalidatePayments();
        toast.success("Payment recorded successfully", "Payment Recorded");
      }

      if (paymentId) {
        handlePreview(paymentId, {
          ...payload,
          id: paymentId,
          appliedInvoices: appliedInvoicesPayload,
        });
      }
    } catch (error: any) {
      console.error("Error in handleSaveAndSend:", error);
      toast.error(error.response?.data?.message || "Failed to record payment", "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Boolean(
    paymentData.customerId &&
      typeof paymentData.amountReceived === "number" &&
      paymentData.amountReceived > 0 &&
      paymentData.paymentDate
  );

  const paymentModeOptions = [
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Bank Remittance", label: "Bank Remittance" },
    { value: "Cheque", label: "Cheque" },
  ];

  return {
    isEditMode,
    paymentData,
    setPaymentData,
    customerSearchTerm,
    setCustomerSearchTerm,
    customerDropdownOpen,
    setCustomerDropdownOpen,
    selectedCustomerData,
    setSelectedCustomerData,
    unpaidInvoices,
    setUnpaidInvoices,
    appliedAmounts,
    setAppliedAmounts,
    payAllRemaining,
    setPayAllRemaining,
    isSubmitting,
    isSaving,
    filteredCustomers,
    totalApplied,
    amountInExcess,
    selectCustomer,
    handleAmountReceivedChange,
    handlePayAllRemainingToggle,
    handleAppliedAmountChange,
    handlePayInFull,
    handleSaveDraft,
    handleSaveAndSend,
    customersLoading,
    isFormValid,
    paymentModeOptions,
  };
};

export default usePaymentForm;
