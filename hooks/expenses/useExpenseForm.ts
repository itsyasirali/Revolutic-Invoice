"use client";

import { useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import { invalidateExpenses, invalidateExpenseCategories } from "@/lib/swr";
import { toast } from "@/components/ui";
import useCustomerOptions from "@/hooks/common/useCustomerOptions";
import useProjectOptions from "@/hooks/common/useProjectOptions";
import { useExpense, useExpenseCategories } from "./useExpense";

type AlertState = { show: boolean; type: "success" | "error" | "warning" | "info"; message: string };

const useExpenseForm = () => {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const { expense, loading: expenseLoading } = useExpense(id);
  const categories = useExpenseCategories();
  const { options: customerOptions } = useCustomerOptions();

  const [saving, setSaving] = useState(false);
  const [billable, setBillable] = useState<boolean | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const presetProjectId = useSearchParams()?.get("projectId") || "";
  const [alert, setAlert] = useState<AlertState>({ show: false, type: "info", message: "" });

  const dismissAlert = () => setAlert({ show: false, type: "info", message: "" });

  // Controlled values fall back to the loaded expense until the user touches them.
  const billableValue = billable ?? expense?.billable ?? false;
  const projectValue =
    projectId ?? (expense?.projectId ? String(expense.projectId) : id ? "" : presetProjectId);
  const { projects, options: projectOptions } = useProjectOptions(projectValue || null);
  const selectedProject = projects.find((p) => String(p.id) === projectValue);
  // The customer always follows the selected project.
  const customerValue = selectedProject
    ? String(selectedProject.customerId)
    : (customerId ?? (expense?.customerId ? String(expense.customerId) : ""));

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      form.set("billable", String(billableValue));
      form.set("customerId", customerValue);
      form.set("projectId", projectValue);
      const newCategory = String(form.get("newCategory") ?? "").trim();
      if (newCategory) form.set("categoryName", newCategory);
      form.delete("newCategory");
      if (!(form.get("attachment") as File | null)?.size) form.delete("attachment");

      setSaving(true);
      dismissAlert();
      try {
        // Same multipart convention as the customer/template forms.
        if (id) {
          await axios.patch(`/expenses/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
        } else {
          await axios.post("/expenses", form, { headers: { "Content-Type": "multipart/form-data" } });
        }
        await Promise.all([invalidateExpenses(), invalidateExpenseCategories()]);
        toast.success(
          id ? "Expense updated successfully" : "Expense created successfully",
          id ? "Expense Updated" : "Expense Created",
        );
        router.refresh();
        router.push(id ? `/expenses/${id}` : "/expenses");
      } catch (err) {
        const msg = (err as { response?: { data?: { message?: string } }; message?: string });
        setAlert({
          show: true,
          type: "error",
          message: msg.response?.data?.message || msg.message || "Failed to save expense.",
        });
      } finally {
        setSaving(false);
      }
    },
    [id, billableValue, customerValue, projectValue, router],
  );

  return {
    isEdit: !!id,
    expense,
    loading: expenseLoading,
    saving,
    categories,
    customerOptions,
    billable: billableValue,
    setBillable,
    customerId: customerValue,
    setCustomerId,
    projectId: projectValue,
    setProjectId,
    projectOptions: [{ label: "No project", value: "" }, ...projectOptions],
    alert,
    dismissAlert,
    handleSubmit,
    handleCancel: () => router.push(id ? `/expenses/${id}` : "/expenses"),
  };
};

export default useExpenseForm;
