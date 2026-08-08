"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@/lib/axios";
import useCustomers from "@/hooks/customers/useCustomers";
import usePaymentActions from "./usePaymentActions";
import type { PaymentFormData, UsePaymentFormReturn } from "@/types/payment";
import { getNavState } from "@/lib/clientNavState";

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

  useEffect(() => {
    const navPayment = id ? getNavState<any>(`payment:${id}`) : null;
    let paymentSource = navPayment;

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
            const remaining = Number(inv.remaining || 0);
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

  const filteredCustomers = customers.filter((customer) => {
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
  });

  const handleSaveDraft = async () => {
    if (isSaving || isSubmitting) return;

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
        router.push("/payments");
      } else {
        const response = await axios.post(`/payments`, payload);
        if (response.data) {
          router.push("/payments");
        }
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndSend = async () => {
    if (isSubmitting || isSaving) return;

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
      } else {
        const response = await axios.post(`/payments`, payload);
        paymentId =
          response.data.id || response.data.payment?.id;
      }

      if (paymentId) {
        handlePreview(paymentId, {
          ...payload,
          id: paymentId,
          appliedInvoices: appliedInvoicesPayload,
        });
      }
    } catch (error) {
      console.error("Error in handleSaveAndSend:", error);
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
