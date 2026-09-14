"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useDeleteCustomer from "./useCustomerDelete";
import { useCustomerDetails } from "./useCustomerDetails";
import { useCustomerFinancials } from "./useCustomerFinancials";

export type CustomerTab = "invoices" | "transactions";

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

  const [activeTab, setActiveTab] = useState<CustomerTab>("invoices");

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
    handleEdit,
    handleNewInvoice,
    handleDelete,
    handleBackClick,
    handleInvoiceClick,
    handleTransactionClick,
  };
};

export default useCustomerDetailsView;
