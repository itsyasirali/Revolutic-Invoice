"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import axios from "@/lib/axios";
import { swrFetcher } from "@/lib/swr";
import { toast } from "@/components/ui";
import { DEFAULT_PORTAL_SETTINGS, type PortalSettings } from "@/types/portal";

export interface PortalActivityRow {
  id: number;
  type: string;
  title?: string | null;
  customerId: number;
  customerName?: string;
  entityType?: string | null;
  entityId?: number | null;
  readAt?: string | null;
  createdAt: string;
}

const usePortalSettings = () => {
  const { data, isLoading } = useSWR<{ settings: PortalSettings }>("/portal-admin/settings", swrFetcher, {
    revalidateOnFocus: false,
  });
  const activity = useSWR<{ activities: PortalActivityRow[]; unread: number }>(
    "/portal-admin/activity",
    swrFetcher,
  );
  const [form, setForm] = useState<PortalSettings>(DEFAULT_PORTAL_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  const set = <K extends keyof PortalSettings>(key: K, value: PortalSettings[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await axios.put("/portal-admin/settings", form);
      toast.success("Portal settings saved", "Saved");
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Failed to save settings", "Error");
    } finally {
      setSaving(false);
    }
  };

  const markRead = async () => {
    await axios.post("/portal-admin/activity");
    await activity.mutate();
  };

  return { isLoading, form, set, saving, save, activity: { data: activity.data }, markRead };
};

export default usePortalSettings;
