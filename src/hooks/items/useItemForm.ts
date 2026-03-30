"use client";
import { useState, useEffect } from "react";
import axios from "../../Service/axios";
import type { ItemFormData } from "../../types/items";

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
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
};

export const useItemForm = (initialData?: ItemFormData | null) => {
  const [itemType, setItemType] = useState<ItemType>(initialData?.type || "Goods");

  useEffect(() => {
    if (initialData?.type) {
      setItemType(initialData.type);
    }
  }, [initialData?.type]);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ show: false, type: 'info', message: '' });

  const dismissAlert = () => {
    setAlert({ show: false, type: 'info', message: '' });
  };

  const handleSubmit = async (payload: ItemPayload) => {
    setLoading(true);
    dismissAlert();

    try {
      if (initialData?.id) {
        const res = await axios.put(
          `/items/${initialData.id}`,
          payload
        );
        if (res.status === 200 || res.status === 201) {
          // Success alert suppressed as per user request
        } else {
          setAlert({
            show: true,
            type: 'error',
            message: res.data?.message || 'Failed to update item.'
          });
        }
      } else {
        const res = await axios.post(
          `/items`,
          payload
        );
        if (res.status === 200 || res.status === 201) {
          // Success alert suppressed as per user request
        } else {
          setAlert({
            show: true,
            type: 'error',
            message: res.data?.message || 'Failed to save item.'
          });
        }
      }

    } catch (error: unknown) {
      console.error("Error saving item:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setAlert({
        show: true,
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to save item.'
      });
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
