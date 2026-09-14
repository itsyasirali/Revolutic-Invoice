"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import useDeleteItems from "./useItemsDelete";
import type { Item } from "@/types/item";
import { getNavState } from "@/lib/clientNavState";
import axios from "@/lib/axios";

export const useItemDetailsView = () => {
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const router = useRouter();
  const {
    deleteItems,
    loading: deleteLoading,
    alert,
    dismissAlert,
    confirmDialog,
    confirmDelete,
    hideConfirmDialog,
  } = useDeleteItems();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const navItem = getNavState<Item>(`item:${id}`);
    if (navItem) {
      setItem(navItem);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    axios
      .get("/items")
      .then((res) => {
        if (isCancelled) return;
        const found = (res.data?.items || []).find(
          (i: any) => String(i.id) === String(id),
        );
        if (found) {
          setItem(found);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch item:", err);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
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
    loading: loading || deleteLoading,
    handleEdit,
    handleDelete,
    handleBackClick,
    alert,
    dismissAlert,
    confirmDialog,
    confirmDelete,
    hideConfirmDialog,
  };
};

export default useItemDetailsView;
