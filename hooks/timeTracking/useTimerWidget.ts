"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { toast } from "@/components/ui";
import useTimer from "@/hooks/timeTracking/useTimer";
import useCustomerOptions from "@/hooks/common/useCustomerOptions";
import useProjectOptions from "@/hooks/common/useProjectOptions";
import { invalidateTimeEntries } from "@/lib/swr";

const pad = (n: number) => String(n).padStart(2, "0");
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * State and saving for the Start / Pause / Stop timer. Stopping saves a TimeEntry
 * through the normal API; the server recomputes duration and amount.
 */
export const useTimerWidget = (
  fixedProjectId?: string | number,
  onSaved?: () => void | Promise<void>,
) => {
  const timer = useTimer(
    fixedProjectId ? `revolutic:time-tracking:timer:project:${fixedProjectId}` : undefined,
  );
  const { options: customerOptions } = useCustomerOptions();
  const [customerId, setCustomerId] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [projectId, setProjectId] = useState(fixedProjectId ? String(fixedProjectId) : "");
  const [taskId, setTaskId] = useState("");
  const { projects, options: projectOptions, taskOptions } = useProjectOptions(projectId || null);
  const selectedProject = projects.find((p) => String(p.id) === projectId);
  const [hourlyRate, setHourlyRate] = useState("");
  const [billable, setBillable] = useState(true);
  const [saving, setSaving] = useState(false);

  const stop = async () => {
    // Stopping halts the clock right away, even if validation or saving fails
    // below; the timer can then be resumed or stopped again.
    timer.pause();
    const activeMinutes = Math.round(timer.elapsedMs / 60000);
    if (activeMinutes < 1) {
      toast.error("Run the timer for at least one minute before stopping.", "Timer too short");
      return;
    }
    if (billable && !customerId && !selectedProject) {
      toast.error("Choose a customer for billable time.", "Customer required");
      return;
    }
    const started = new Date(timer.startedAt ?? Date.now());
    // End time = start + active (non-paused) time, so duration reflects work done.
    const end = new Date(started.getTime() + activeMinutes * 60000);

    setSaving(true);
    try {
      await axios.post("/time-tracking", {
        customerId: selectedProject ? selectedProject.customerId : customerId || null,
        project,
        projectId: projectId || null,
        taskId: projectId ? taskId || null : null,
        description,
        hourlyRate: hourlyRate === "" ? undefined : Number(hourlyRate) || 0,
        billable,
        date: ymd(started),
        startTime: hhmm(started),
        endTime: hhmm(end),
      });
      await invalidateTimeEntries();
      toast.success("Time entry saved", "Timer Stopped");
      timer.reset();
      setDescription("");
      setTaskId("");
      await onSaved?.();
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Failed to save time entry", "Error");
    } finally {
      setSaving(false);
    }
  };

  return {
    timer, customerOptions, customerId, setCustomerId, description, setDescription,
    project, setProject, projectId, setProjectId, taskId, setTaskId,
    projectOptions, taskOptions, selectedProject, hourlyRate, setHourlyRate,
    billable, setBillable, saving, stop,
  };
};

export default useTimerWidget;
