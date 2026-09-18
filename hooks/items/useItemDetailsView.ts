"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const itemInitials = useMemo(() => {
    const name = item?.name?.trim() || "";
    if (!name) return "IT";
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [item?.name]);

  const itemIdDisplay = useMemo(() => {
    if (!item?.id) return "ITEM-0001";
    const str = String(item.id);
    if (str.toUpperCase().startsWith("ITEM-")) return str;
    if (/^\d+$/.test(str)) return `ITEM-${str.padStart(4, "0")}`;
    return `ITEM-${str.slice(0, 6).toUpperCase()}`;
  }, [item?.id]);

  return {
    item,
    id,
    mounted,
    loading: loading || deleteLoading,
    itemInitials,
    itemIdDisplay,
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
