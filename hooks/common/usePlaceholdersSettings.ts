"use client";

import { useMemo, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "@/components/ui";
import useCustomPlaceholders from "@/hooks/common/useCustomPlaceholders";
import { PLACEHOLDER_DEFS, validateCustomKey } from "@/lib/placeholders/registry";

const usePlaceholdersSettings = () => {
  const { custom, mutate } = useCustomPlaceholders();
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const customShown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? custom.filter(
          (c) => c.key.toLowerCase().includes(q) || (c.value || "").toLowerCase().includes(q),
        )
      : custom;
  }, [custom, query]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, typeof PLACEHOLDER_DEFS>();
    PLACEHOLDER_DEFS.forEach((d) => {
      if (q && !d.key.toLowerCase().includes(q) && !d.label.toLowerCase().includes(q)) return;
      map.set(d.group, [...(map.get(d.group) || []), d]);
    });
    return Array.from(map.entries());
  }, [query]);

  /** Returns true when the placeholder was saved. */
  const add = async (): Promise<boolean> => {
    const err = validateCustomKey(key);
    if (err) {
      toast.error(err, "Invalid key");
      return false;
    }
    if (!value.trim()) {
      toast.error("Value is required", "Invalid value");
      return false;
    }
    setSaving(true);
    try {
      await axios.post("/placeholders", { key, label, value });
      setKey("");
      setLabel("");
      setValue("");
      await mutate();
      toast.success("Placeholder added", "Saved");
      return true;
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to add placeholder", "Error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number, k: string) => {
    if (!window.confirm(`Delete %${k}%? Text that still uses it will show the raw token.`)) return;
    try {
      await axios.delete(`/placeholders/${id}`);
      await mutate();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete", "Error");
    }
  };

  const saveValue = async (id: number, current: string, next: string) => {
    if (next === current) return;
    try {
      await axios.put(`/placeholders/${id}`, { value: next });
      await mutate();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update", "Error");
      await mutate();
    }
  };

  return {
    form: { key, label, value, setKey, setLabel, setValue },
    saving,
    query,
    setQuery,
    customShown,
    groups,
    add,
    remove,
    saveValue,
  };
};

export default usePlaceholdersSettings;
