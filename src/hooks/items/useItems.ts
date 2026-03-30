"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "../../Service/axios";
import type { Item } from "../../types/items.d";

const useItemsData = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/items`);
      if (response.status === 200) {
        // Backend returns { items: [...] }
        setItems(response.data.items || []);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch items:", err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message = error.response?.data?.message || error.message || "Failed to fetch items";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
};

export default useItemsData;
