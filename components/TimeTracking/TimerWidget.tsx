"use client";

import React from "react";
import { Play, Pause, Square } from "lucide-react";
import { Button, Card, Input, Select, Checkbox } from "@/components/ui";
import useTimerWidget from "@/hooks/timeTracking/useTimerWidget";

/**
 * Start / Pause / Stop timer. Stopping saves a TimeEntry through the normal
 * API; the server recomputes duration and amount from the start/end times.
 */
interface TimerWidgetProps {
  /** When set, the timer belongs to this project (no project/customer pickers). */
  projectId?: string | number;
  onSaved?: () => void | Promise<void>;
}

const TimerWidget: React.FC<TimerWidgetProps> = ({ projectId: fixedProjectId, onSaved }) => {
  const {
    timer, customerOptions, customerId, setCustomerId, description, setDescription,
    project, setProject, projectId, setProjectId, taskId, setTaskId,
    projectOptions, taskOptions, hourlyRate, setHourlyRate,
    billable, setBillable, saving, stop,
  } = useTimerWidget(fixedProjectId, onSaved);

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
              {!fixedProjectId && (
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
              )}
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
