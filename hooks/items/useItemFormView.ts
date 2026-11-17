"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import useRouter from "@/hooks/organization/useOrgRouter";
import useDomainItemForm from "./useItemForm";
import type { ItemFormData } from "@/types/item";
import { getNavState, clearNavState } from "@/lib/clientNavState";

const useItemFormView = () => {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = params?.id;

  // React Router's <Link state> / navigate(path, { state }) has no App
  // Router equivalent — the edit page (/items/edit/[id]) originally read
  // the item straight from location.state; here it's read from the same
  // sessionStorage-backed nav state that useItemActions writes to under
  // the `item:${id}` key.
  const [item, setItem] = useState<ItemFormData | null>(() =>
    id
      ? (getNavState<ItemFormData>(`item:${id}`) ?? null)
      : (getNavState<ItemFormData>("item:clone") ?? null),
  );

  useEffect(() => {
    if (id) {
      const navItem = getNavState<ItemFormData>(`item:${id}`);
      if (navItem) {
        setItem(navItem);
      }
    }
  }, [id]);

  const {
    itemType,
    setItemType,
    handleSubmit,
    loading,
    alert,
    dismissAlert,
  } = useDomainItemForm(item);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      const payload = {
        type: (formData.get("type") as "Goods" | "Service") || itemType,
        name: String(formData.get("name") || ""),
        unit: String(formData.get("unit") || ""),
        sellingPrice: formData.get("sellingPrice")
          ? Number(formData.get("sellingPrice"))
          : undefined,
        description: String(formData.get("description") || ""),
        status: (formData.get("status") as "Active" | "inActive") || "Active",
      };

      const success = await handleSubmit(payload);
      if (success) {
        clearNavState("item:clone");
        router.refresh();
        router.push(id ? `/items/${id}` : "/items");
      }
    },
    [itemType, handleSubmit, router, id],
  );

  const handleCancel = useCallback(() => {
    clearNavState("item:clone");
    router.push(id ? `/items/${id}` : "/items");
  }, [router, id]);

  return {
    item,
    itemType,
    setItemType,
    handleFormSubmit,
    handleCancel,
    loading,
    alert,
    dismissAlert,
  };
};

export default useItemFormView;
