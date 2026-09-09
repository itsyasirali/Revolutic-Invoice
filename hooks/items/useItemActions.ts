"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Item, UseItemActionsProps } from "@/types/item";
import { setNavState } from "@/lib/clientNavState";

const useItemActions = ({
  selectedIds,
  setSelectedIds,
  updateStatus,
  deleteItems,
  refetch,
  setOpenDropdownId,
}: UseItemActionsProps) => {
  const router = useRouter();

  const handleNew = useCallback(() => {
    router.push("/items/new");
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
      await deleteItems(targetIds, () => {
        setSelectedIds([]);
        if (refetch) refetch();
      });
    },
    [selectedIds, deleteItems, refetch, setSelectedIds],
  );

  const handleEdit = useCallback(
    (item: Item) => {
      setNavState(`item:${item.id}`, item);
      router.push(`/items/edit/${item.id}`);
      setOpenDropdownId?.(null);
    },
    [router, setOpenDropdownId],
  );

  const handleRowClick = (item: Item) => {
    setNavState(`item:${item.id}`, item);
    router.push(`/items/${item.id}`);
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

export default useItemActions;
