"use client";

import useSWR from "swr";
import axios from "@/lib/axios";
import {
  swrFetcher,
  SWR_KEYS,
  invalidateProjects,
  invalidateQuotes,
  invalidateExpenses,
  invalidateTimeEntries,
  invalidateInvoices,
} from "@/lib/swr";
import { toast } from "@/components/ui";
import type { ProjectDetailData } from "@/types/project";

/** Single project with tasks, time, expenses, quote and invoices. */
export const useProject = (id?: string) => {
  const { data, error, isLoading, mutate } = useSWR<ProjectDetailData>(
    id ? `${SWR_KEYS.projects}/${id}` : null,
    swrFetcher,
    { revalidateOnFocus: true },
  );
  return {
    data: data ?? null,
    loading: isLoading,
    notFound: !!error && !data,
    refetch: () => mutate(),
  };
};

const message = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;

export const addTask = async (projectId: number, name: string) => {
  try {
    await axios.post(`/projects/${projectId}/tasks`, { name });
    await invalidateProjects();
    return true;
  } catch (err) {
    toast.error(message(err, "Failed to add task"), "Error");
    return false;
  }
};

export const updateTask = async (
  projectId: number,
  taskId: number,
  patch: { name?: string; status?: string },
) => {
  try {
    await axios.patch(`/projects/${projectId}/tasks/${taskId}`, patch);
    await invalidateProjects();
    return true;
  } catch (err) {
    toast.error(message(err, "Failed to update task"), "Error");
    return false;
  }
};

export const deleteTask = async (projectId: number, taskId: number) => {
  try {
    await axios.delete(`/projects/${projectId}/tasks/${taskId}`);
    await invalidateProjects();
    return true;
  } catch (err) {
    toast.error(message(err, "Failed to delete task"), "Error");
    return false;
  }
};

/** Project -> Invoice (all billable, un-invoiced time + expenses). */
export const billProject = async (projectId: number) => {
  try {
    const res = await axios.post(`/projects/${projectId}/invoice`, {});
    await Promise.all([
      invalidateProjects(),
      invalidateTimeEntries(),
      invalidateExpenses(),
      invalidateInvoices(),
    ]);
    toast.success("Invoice created from project", "Invoice Created");
    return res.data.invoice as { id: number };
  } catch (err) {
    toast.error(message(err, "Failed to create invoice"), "Error");
    return null;
  }
};

/** Quote -> Project. */
export const createProjectFromQuote = async (quoteId: number | string) => {
  try {
    const res = await axios.post(`/quotes/${quoteId}/project`);
    await Promise.all([invalidateProjects(), invalidateQuotes()]);
    toast.success("Project created from quote", "Project Created");
    return res.data.project as { id: number };
  } catch (err) {
    toast.error(message(err, "Failed to create project"), "Error");
    return null;
  }
};

export default useProject;
