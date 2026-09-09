"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import type { ItemFormData } from "@/types/item";

type ItemType = "Goods" | "Service";

type ItemPayload = {
  type: ItemType;
  name: string;
  unit?: string | null;
  sellingPrice?: number;
  description?: string;
  tax?: number;
  status?: "Active" | "inActive";
};

type AlertState = {
  show: boolean;
  type: "success" | "error" | "warning" | "info";
  message: string;
};

export const useItemForm = (initialData?: ItemFormData | null) => {
  const [itemType, setItemType] = useState<ItemType>(
    initialData?.type || "Goods",
  );

  useEffect(() => {
    if (initialData?.type) {
      setItemType(initialData.type);
    }
  }, [initialData?.type]);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });

  const dismissAlert = () => {
    setAlert({ show: false, type: "info", message: "" });
  };

  const handleSubmit = async (payload: ItemPayload): Promise<boolean> => {
    setLoading(true);
    dismissAlert();

    try {
      const res = initialData?.id
        ? await axios.put(`/items/${initialData.id}`, payload)
        : await axios.post(`/items`, payload);

      if (res.status === 200 || res.status === 201) {
        return true;
      }

      setAlert({
        show: true,
        type: "error",
        message:
          res.data?.message ||
          (initialData?.id ? "Failed to update item." : "Failed to save item."),
      });
      return false;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; detail?: string } };
        message?: string;
      };
      console.error("Error saving item:", error, err.response?.data);
      const displayMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to save item.";
      setAlert({
        show: true,
        type: "error",
        message: displayMsg,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    itemType,
    setItemType,
    handleSubmit,
    loading,
    alert,
    dismissAlert,
  };
};

export default useItemForm;
