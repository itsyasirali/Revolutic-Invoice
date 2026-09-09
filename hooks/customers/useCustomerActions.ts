"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Customer, UseCustomerActionsProps } from "@/types/customer";
import { setNavState } from "@/lib/clientNavState";

const useCustomerActions = ({
  selectedIds,
  setSelectedIds,
  updateStatus,
  deleteCustomers,
  refetch,
  setOpenDropdownId,
}: UseCustomerActionsProps) => {
  const router = useRouter();

  const handleNew = useCallback(() => {
    router.push("/customers/new");
  }, [router]);

  const handleSetActive = useCallback(async () => {
    await updateStatus(selectedIds, "Active", refetch);
    setSelectedIds([]);
  }, [selectedIds, updateStatus, refetch, setSelectedIds]);

  const handleSetInactive = useCallback(async () => {
    await updateStatus(selectedIds, "inActive", refetch);
    setSelectedIds([]);
  }, [selectedIds, updateStatus, refetch, setSelectedIds]);

  const handleDelete = useCallback(
    async (ids?: (string | number)[] | React.SyntheticEvent) => {
      const targetIds = Array.isArray(ids) && ids.length > 0 ? ids : selectedIds;
      if (!targetIds || targetIds.length === 0) return;
      await deleteCustomers(targetIds.map(String), () => {
        setSelectedIds([]);
        if (refetch) refetch();
      });
    },
    [selectedIds, deleteCustomers, refetch, setSelectedIds],
  );

  const handleEdit = useCallback(
    (customer: Customer) => {
      setNavState(`customer:${customer.id}`, customer);
      router.push(`/customers/edit/${customer.id}`);
      setOpenDropdownId?.(null);
    },
    [router, setOpenDropdownId],
  );

  const handleRowClick = (customer: Customer) => {
    setNavState(`customer:${customer.id}`, customer);
    router.push(`/customers/${customer.id}`);
  };

  return {
    handleNew,
    handleSetActive,
    handleSetInactive,
    handleDelete,
    handleEdit,
    handleRowClick,
  };
};

export default useCustomerActions;
