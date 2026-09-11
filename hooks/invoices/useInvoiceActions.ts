"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { UIInvoiceListItem } from "./useInvoicesData";
import { setNavState } from "@/lib/clientNavState";

export interface UseInvoiceActionsProps {
  selectedIds?: (string | number)[];
  setSelectedIds?: (ids: string[]) => void;
  deleteInvoices?: (
    selectedIds: (string | number)[],
    refetch?: () => void
  ) => Promise<void>;
  refetch?: () => void;
  setOpenDropdownId?: (id: string | null) => void;
}

const useInvoiceActions = (props?: UseInvoiceActionsProps) => {
  const router = useRouter();
  const {
    selectedIds,
    setSelectedIds,
    deleteInvoices,
    refetch,
  } = props || {};

  const handleNew = useCallback(() => {
    router.push("/invoices/new");
  }, [router]);

  const handleEdit = useCallback(
    (invoice: any) => {
      setNavState(`invoice:${invoice.id}`, invoice);
      router.push(`/invoices/edit/${invoice.id}`);
    },
    [router]
  );

  const handlePreview = useCallback(
    (invoice: any) => {
      setNavState(`invoice:${invoice.id}`, invoice);
      router.push(`/invoices/preview/${invoice.id}`);
    },
    [router]
  );

  const handleBackToList = useCallback(() => {
    router.push("/invoices");
  }, [router]);

  const handleBackToEdit = useCallback(
    (invoice: any) => {
      setNavState(`invoice:${invoice.id}`, invoice);
      router.push(`/invoices/edit/${invoice.id}`);
    },
    [router]
  );

  const handleDelete = useCallback(
    async (ids?: (string | number)[] | React.SyntheticEvent) => {
      const targetIds = Array.isArray(ids) && ids.length > 0 ? ids : selectedIds;
      if (deleteInvoices && targetIds && targetIds.length > 0) {
        await deleteInvoices(targetIds, () => {
          setSelectedIds?.([]);
          refetch?.();
        });
      }
    },
    [selectedIds, deleteInvoices, refetch, setSelectedIds],
  );

  const handleRowClick = useCallback(
    (invoice: UIInvoiceListItem) => {
      setNavState(`invoice:${invoice.id}`, invoice.raw || invoice);
      router.push(`/invoices/${invoice.id}`);
    },
    [router]
  );

  return {
    handleNew,
    handleEdit,
    handlePreview,
    handleBackToList,
    handleBackToEdit,
    handleDelete,
    handleRowClick,
  };
};

export default useInvoiceActions;
