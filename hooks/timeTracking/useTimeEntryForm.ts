"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import axios from "@/lib/axios";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import { SWR_KEYS, swrFetcher, invalidateTimeEntries } from "@/lib/swr";
import { toast } from "@/components/ui";
import useCustomerOptions from "@/hooks/common/useCustomerOptions";
import useProjectOptions from "@/hooks/common/useProjectOptions";
import type { TimeEntry } from "@/types/timeEntry";

export const useTimeEntry = (id?: string) => {
  const { data, error, isLoading, mutate } = useSWR<{ timeEntry: TimeEntry }>(
    id ? `${SWR_KEYS.timeEntries}/${id}` : null,
    swrFetcher,
    { revalidateOnFocus: true },
  );
  return {
    timeEntry: data?.timeEntry ?? null,
    loading: isLoading,
    notFound: !!error && !data,
    refetch: () => mutate(),
  };
};

const toMinutes = (v: string) => {
  const m = /^(\d{2}):(\d{2})$/.exec(v);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

const useTimeEntryForm = () => {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const { timeEntry, loading: entryLoading } = useTimeEntry(id);
  const { options: customerOptions } = useCustomerOptions();
  const presetProjectId = useSearchParams()?.get("projectId") || "";

  const [saving, setSaving] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [billable, setBillable] = useState<boolean | null>(null);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [rate, setRate] = useState<string | null>(null);
  const [alert, setAlert] = useState({ show: false, type: "error" as const, message: "" });

  const projectValue =
    projectId ?? (timeEntry?.projectId ? String(timeEntry.projectId) : id ? "" : presetProjectId);
  const { projects, options: projectOptions, taskOptions } = useProjectOptions(projectValue || null);
  const selectedProject = projects.find((p) => String(p.id) === projectValue);
  // The customer always follows the selected project.
  const customerValue = selectedProject
    ? String(selectedProject.customerId)
    : (customerId ?? (timeEntry?.customerId ? String(timeEntry.customerId) : ""));
  const taskValue = taskId ?? (timeEntry?.taskId ? String(timeEntry.taskId) : "");
  const billableValue = billable ?? timeEntry?.billable ?? true;
  const startValue = start ?? timeEntry?.startTime ?? "";
  const endValue = end ?? timeEntry?.endTime ?? "";
  const rateValue =
    rate ??
    (timeEntry
      ? String(timeEntry.hourlyRate)
      : selectedProject && Number(selectedProject.hourlyRate) > 0
        ? String(selectedProject.hourlyRate)
        : "");

  // Preview only: the server recomputes duration and amount on save.
  const preview = useMemo(() => {
    const s = toMinutes(startValue);
    const e = toMinutes(endValue);
    if (s === null || e === null || s === e) return null;
    const minutes = e > s ? e - s : e + 1440 - s;
    return { minutes, amount: ((Number(rateValue) || 0) * minutes) / 60 };
  }, [startValue, endValue, rateValue]);

  const handleSubmit = useCallback(
    async (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      const form = new FormData(ev.currentTarget);
      const payload = {
        customerId: customerValue || null,
        project: String(form.get("project") || ""),
        projectId: projectValue || null,
        taskId: projectValue ? taskValue || null : null,
        description: String(form.get("description") || ""),
        date: String(form.get("date") || ""),
        startTime: startValue,
        endTime: endValue,
        hourlyRate: Number(rateValue) || 0,
        billable: billableValue,
      };
      setSaving(true);
      setAlert({ show: false, type: "error", message: "" });
      try {
        if (id) await axios.patch(`/time-tracking/${id}`, payload);
        else await axios.post("/time-tracking", payload);
        await invalidateTimeEntries();
        toast.success(
          id ? "Time entry updated successfully" : "Time entry created successfully",
          id ? "Time Entry Updated" : "Time Entry Created",
        );
        router.refresh();
        router.push(id ? `/time-tracking/${id}` : "/time-tracking");
      } catch (err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        setAlert({
          show: true,
          type: "error",
          message: e.response?.data?.message || e.message || "Failed to save time entry.",
        });
      } finally {
        setSaving(false);
      }
    },
    [id, customerValue, projectValue, taskValue, startValue, endValue, rateValue, billableValue, router],
  );

  return {
    isEdit: !!id,
    timeEntry,
    loading: entryLoading,
    saving,
    customerOptions,
    customerId: customerValue,
    setCustomerId,
    projectId: projectValue,
    setProjectId: (v: string) => {
      setProjectId(v);
      setTaskId(null);
      setRate(null);
    },
    taskId: taskValue,
    setTaskId,
    projectOptions: [{ label: "No project", value: "" }, ...projectOptions],
    taskOptions: [{ label: "No task", value: "" }, ...taskOptions],
    billable: billableValue,
    setBillable,
    startTime: startValue,
    setStartTime: setStart,
    endTime: endValue,
    setEndTime: setEnd,
    hourlyRate: rateValue,
    setHourlyRate: setRate,
    preview,
    alert,
    dismissAlert: () => setAlert({ show: false, type: "error", message: "" }),
    handleSubmit,
    handleCancel: () => router.push(id ? `/time-tracking/${id}` : "/time-tracking"),
  };
};

export default useTimeEntryForm;
