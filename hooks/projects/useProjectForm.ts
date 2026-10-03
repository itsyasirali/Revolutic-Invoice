"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "@/lib/axios";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import { invalidateProjects } from "@/lib/swr";
import { toast } from "@/components/ui";
import useCustomerOptions from "@/hooks/common/useCustomerOptions";
import { useProject } from "./useProject";
import type { BillingMethod } from "@/types/project";

const useProjectForm = () => {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const { data, loading } = useProject(id);
  const project = data?.project ?? null;
  const { customers, options: customerOptions } = useCustomerOptions();

  const [saving, setSaving] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [billingMethod, setBillingMethod] = useState<BillingMethod | null>(null);
  const [alert, setAlert] = useState({ show: false, type: "error" as const, message: "" });

  const customerValue = customerId ?? (project ? String(project.customerId) : "");
  const statusValue = status ?? project?.status ?? "Active";
  const billingValue = billingMethod ?? project?.billingMethod ?? "Hourly";
  const defaultCurrency =
    project?.currency ||
    customers.find((c) => String(c.id) === customerValue)?.currency ||
    "PKR";

  const handleSubmit = useCallback(
    async (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      const form = new FormData(ev.currentTarget);
      const text = (k: string) => String(form.get(k) || "");
      const payload: Record<string, unknown> = {
        name: text("name"),
        description: text("description"),
        customerId: customerValue || null,
        status: statusValue,
        billingMethod: billingValue,
        hourlyRate: Number(text("hourlyRate")) || 0,
        fixedAmount: Number(text("fixedAmount")) || 0,
        budgetHours: Number(text("budgetHours")) || 0,
        budgetAmount: Number(text("budgetAmount")) || 0,
        currency: text("currency") || defaultCurrency,
        startDate: text("startDate") || null,
        endDate: text("endDate") || null,
      };
      if (!id) {
        payload.tasks = text("tasks")
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean);
      }
      setSaving(true);
      setAlert({ show: false, type: "error", message: "" });
      try {
        const res = id
          ? await axios.put(`/projects/${id}`, payload)
          : await axios.post("/projects", payload);
        await invalidateProjects();
        toast.success(
          id ? "Project updated successfully" : "Project created successfully",
          id ? "Project Updated" : "Project Created",
        );
        router.push(`/projects/${res.data.project.id}`);
      } catch (err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        setAlert({
          show: true,
          type: "error",
          message: e.response?.data?.message || e.message || "Failed to save project.",
        });
      } finally {
        setSaving(false);
      }
    },
    [id, customerValue, statusValue, billingValue, defaultCurrency, router],
  );

  return {
    isEdit: !!id,
    project,
    loading,
    saving,
    customerOptions,
    customerId: customerValue,
    setCustomerId,
    status: statusValue,
    setStatus,
    billingMethod: billingValue,
    setBillingMethod,
    defaultCurrency,
    alert,
    dismissAlert: () => setAlert({ show: false, type: "error", message: "" }),
    handleSubmit,
    handleCancel: () => router.push(id ? `/projects/${id}` : "/projects"),
  };
};

export default useProjectForm;
