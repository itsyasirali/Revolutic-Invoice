"use client";

import { useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import useDeleteItems from "./useItemsDelete";
import type { Item } from "@/types/item";
import { getNavState } from "@/lib/clientNavState";

export const useItemDetailsView = () => {
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const router = useRouter();
  const { deleteItems, loading: deleteLoading } = useDeleteItems();

  // Same sessionStorage-backed nav state substitute for react-router's
  // location.state used across the customers module — the item is looked
  // up under the `item:${id}` key written by useItemActions.
  const item = useMemo<Item | null>(() => {
    return (id ? getNavState<Item>(`item:${id}`) : undefined) ?? null;
  }, [id]);

  const handleEdit = useCallback(() => {
    if (item && id) {
      router.push(`/items/edit/${id}`);
    }
  }, [item, id, router]);

  const handleDelete = useCallback(async () => {
    if (id) {
      await deleteItems([id], () => {
        router.push("/items");
      });
    }
  }, [id, deleteItems, router]);

  const handleBackClick = useCallback(() => {
    router.push("/items");
  }, [router]);

  return {
    item,
    id,
    loading: deleteLoading,
    handleEdit,
    handleDelete,
    handleBackClick,
  };
};

export default useItemDetailsView;
