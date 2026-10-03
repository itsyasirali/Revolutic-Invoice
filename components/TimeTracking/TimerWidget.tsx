"use client";

import React, { useState } from "react";
import { Play, Pause, Square } from "lucide-react";
import axios from "@/lib/axios";
import { Button, Card, Input, Select, Checkbox, toast } from "@/components/ui";
import useTimer from "@/hooks/timeTracking/useTimer";
import useCustomerOptions from "@/hooks/common/useCustomerOptions";
import useProjectOptions from "@/hooks/common/useProjectOptions";
import { invalidateTimeEntries } from "@/lib/swr";

const pad = (n: number) => String(n).padStart(2, "0");
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Start / Pause / Stop timer. Stopping saves a TimeEntry through the normal
 * API; the server recomputes duration and amount from the start/end times.
 */
const TimerWidget: React.FC = () => {
  const timer = useTimer();
  const { options: customerOptions } = useCustomerOptions();
  const [customerId, setCustomerId] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const { projects, options: projectOptions, taskOptions } = useProjectOptions(projectId || null);
  const selectedProject = projects.find((p) => String(p.id) === projectId);
  const [hourlyRate, setHourlyRate] = useState("");
  const [billable, setBillable] = useState(true);
  const [saving, setSaving] = useState(false);

  const stop = async () => {
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
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Failed to save time entry", "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-2 sm:px-4 md:px-6">
      <Card padding="sm">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <span className="font-mono text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {timer.display}
            </span>
            <div className="flex items-center gap-2">
              {!timer.running ? (
                <Button size="sm" variant="primary" icon={<Play className="w-4 h-4" />} onClick={timer.start}>
                  {timer.active ? "Resume" : "Start Timer"}
                </Button>
              ) : (
                <Button size="sm" variant="warning" icon={<Pause className="w-4 h-4" />} onClick={timer.pause}>
                  Pause
                </Button>
              )}
              {timer.active && (
                <Button
                  size="sm"
                  variant="danger"
                  icon={<Square className="w-4 h-4" />}
                  onClick={stop}
                  loading={saving}
                >
                  Stop
                </Button>
              )}
            </div>
          </div>

          {timer.active && (
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <Select
                label="Project"
                selectSize="sm"
                placeholder="No project"
                options={[{ label: "No project", value: "" }, ...projectOptions]}
                value={projectId}
                onValueChange={(v) => {
                  setProjectId(v);
                  setTaskId("");
                }}
              />
              {projectId ? (
                <Select
                  label="Task"
                  selectSize="sm"
                  placeholder="Select task"
                  options={[{ label: "No task", value: "" }, ...taskOptions]}
                  value={taskId}
                  onValueChange={setTaskId}
                />
              ) : (
                <Select
                  label="Customer"
                  selectSize="sm"
                  placeholder="Select customer"
                  options={customerOptions}
                  value={customerId}
                  onValueChange={setCustomerId}
                />
              )}
              {!projectId && (
                <Input
                  label="Project (free text)"
                  inputSize="sm"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  fullWidth
                />
              )}
              <Input
                label="Description"
                inputSize="sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
              />
              <Input
                label="Hourly rate"
                type="number"
                step="0.01"
                min="0"
                inputSize="sm"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                fullWidth
              />
              <div className="sm:col-span-2 xl:col-span-4">
                <Checkbox
                  label="Billable"
                  checked={billable}
                  onChange={(e) => setBillable(e.target.checked)}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TimerWidget;
