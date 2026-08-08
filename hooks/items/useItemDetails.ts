"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Item, UseItemDetailsProps } from "@/types/item";

// NOTE: this hook is not imported anywhere in the source app (ItemDetails
// renders via useItemDetailsView instead) — it is ported as-is for parity
// since it exists in the source hooks/items directory, but it remains
// unused dead code here too.
const useItemDetails = ({
  items,
  deleteItems,
  deleteLoading,
}: UseItemDetailsProps) => {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const [showMenu, setShowMenu] = useState(false);

  const item = useMemo<Item | undefined>(
    () => items.find((i) => i.id === Number(id)),
    [items, id],
  );

  const handleEdit = useCallback(() => {
    if (item) {
      router.push(`/items/edit/${item.id}`);
      setShowMenu(false);
    }
  }, [item, router]);

  const handleDelete = useCallback(async () => {
    if (item) {
      await deleteItems([String(item.id)], () => router.push("/items"));
    }
    setShowMenu(false);
  }, [item, deleteItems, router]);

  const handleBackClick = useCallback(() => {
    router.back();
  }, [router]);

  return {
    item,
    showMenu,
    setShowMenu,
    handleEdit,
    handleDelete,
    handleBackClick,
    deleteLoading,
  };
};

export default useItemDetails;
