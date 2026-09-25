"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import useDeleteCustomer from "./useCustomerDelete";
import { useCustomerDetails } from "./useCustomerDetails";
import { useCustomerFinancials } from "./useCustomerFinancials";
import { getDownloadUrl } from "@/lib/fileUrl";

export type CustomerTab = "invoices" | "transactions" | "contacts" | "documents";

export const useCustomerDetailsView = () => {
  const router = useRouter();
  const { deleteCustomers, loading: deleteLoading } = useDeleteCustomer();

  const {
    customer,
    primaryContact,
    loading: customerLoading,
  } = useCustomerDetails();
  const { financials, customerInvoices, customerTransactions } =
    useCustomerFinancials(customer);

  const [activeTab, setActiveTab] = useState<CustomerTab>("contacts");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEdit = useCallback(() => {
    if (customer) {
      router.push(`/customers/edit/${customer.id}`);
    }
  }, [customer, router]);

  const handleNewInvoice = useCallback(() => {
    if (customer?.id) {
      router.push(`/invoices/new?customerId=${customer.id}`);
    } else {
      router.push("/invoices/new");
    }
  }, [customer, router]);

  const handleDelete = useCallback(async () => {
    if (customer && customer.id) {
      await deleteCustomers([String(customer.id)], () => {
        router.push("/customers");
      });
    }
  }, [customer, deleteCustomers, router]);

  const handleBackClick = useCallback(() => {
    router.push("/customers");
  }, [router]);

  const handleInvoiceClick = useCallback(
    (invoiceId: string | number) => {
      router.push(`/invoices/preview/${invoiceId}`);
    },
    [router],
  );

  const handleTransactionClick = useCallback(
    (transactionId: string | number) => {
      router.push(`/payments/preview/${transactionId}`);
    },
    [router],
  );

  const customerInitials = useMemo(() => {
    const name = customer?.displayName?.trim() || "";
    if (!name) return "CU";
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [customer?.displayName]);

  const customerIdDisplay = useMemo(() => {
    if (!customer?.id) return "CUST-0001";
    const str = String(customer.id);
    if (str.toUpperCase().startsWith("CUST-")) return str;
    if (/^\d+$/.test(str)) return `CUST-${str.padStart(4, "0")}`;
    return `CUST-${str.slice(0, 6).toUpperCase()}`;
  }, [customer?.id]);

  const customerSince = useMemo(() => {
    const dateVal = customer?.createdAt || customer?.updatedAt;
    if (!dateVal) return "Jan 2026";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "Jan 2026";
      return d.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Jan 2026";
    }
  }, [customer?.createdAt, customer?.updatedAt]);

  const billingAddressLines = useMemo(() => {
    if (!customer?.address) return ["No address provided"];
    const lines = customer.address.split(/\r?\n/).filter(Boolean);
    if (lines.length > 1) return lines;
    const commaParts = customer.address
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (commaParts.length >= 2) return commaParts;
    return [customer.address];
  }, [customer?.address]);

  const customerLocation = useMemo(() => {
    if (!customer?.address) return "Location not set";
    const parts = customer.address
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      return parts.slice(-2).join(", ");
    }
    return parts[0] || "Location not set";
  }, [customer?.address]);

  const email = primaryContact?.email || customer?.email || "No email provided";
  const phone = primaryContact?.phone || customer?.phone || "No phone provided";
  const currency = customer?.currency || "PKR";

  const contactList = useMemo(() => {
    const rawContacts = customer?.contacts || [];
    if (rawContacts.length > 0) {
      return rawContacts.map((contact, idx) => ({
        id: idx,
        name:
          `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
          (idx === 0 ? "Primary Contact" : `Contact ${idx + 1}`),
        email: contact.email || "No email provided",
        phone: contact.contact || "No phone provided",
      }));
    }
    // Older customers without a contacts array: fall back to the
    // customer-level email/phone as a single entry.
    if (customer?.email || customer?.phone) {
      return [
        {
          id: 0,
          name: "Primary Contact",
          email: customer?.email || "No email provided",
          phone: customer?.phone || "No phone provided",
        },
      ];
    }
    return [];
  }, [customer]);

  const documentList = useMemo(() => {
    const rawDocuments = customer?.documents || [];
    return rawDocuments.map((doc, idx) => {
      const isObject = typeof doc === "object" && doc !== null;
      const rawPath = isObject
        ? String((doc as { url?: string; path?: string }).url || (doc as { path?: string }).path || "")
        : String(doc);
      const name =
        (isObject && (doc as { name?: string }).name) ||
        rawPath.split("/").pop() ||
        `Document ${idx + 1}`;
      return {
        id: idx,
        name,
        url: getDownloadUrl(rawPath),
      };
    });
  }, [customer]);

  const tabs = useMemo(
    () => [
      { label: "Contacts", value: "contacts", count: contactList.length },
      { label: "Documents", value: "documents", count: documentList.length },
      { label: "Invoices", value: "invoices", count: customerInvoices.length },
      {
        label: "Transactions",
        value: "transactions",
        count: customerTransactions.length,
      },
    ],
    [
      contactList.length,
      documentList.length,
      customerInvoices.length,
      customerTransactions.length,
    ],
  );

  return {
    customer,
    primaryContact,
    loading: customerLoading || deleteLoading,
    deleteLoading,
    financials,
    customerInvoices,
    customerTransactions,
    activeTab,
    setActiveTab,
    mounted,
    customerInitials,
    customerIdDisplay,
    customerSince,
    billingAddressLines,
    customerLocation,
    email,
    phone,
    contactList,
    documentList,
    currency,
    tabs,
    handleEdit,
    handleNewInvoice,
    handleDelete,
    handleBackClick,
    handleInvoiceClick,
    handleTransactionClick,
  };
};

export default useCustomerDetailsView;
