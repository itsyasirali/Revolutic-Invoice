"use client";

import React from "react";
import {
  Input,
  Select,
  Textarea,
  Button,
  AlertModal,
  PageHeader,
  Checkbox,
  LoadingSpinner,
} from "@/components/ui";
import useTimeEntryForm from "@/hooks/timeTracking/useTimeEntryForm";
import { toDateInput, formatMoney } from "@/lib/format";
import { formatDuration } from "@/types/timeEntry";

const TimeEntryForm: React.FC = () => {
  const f = useTimeEntryForm();
  const entry = f.timeEntry;

  if (f.isEdit && f.loading && !entry) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHeader title={f.isEdit ? "Update Time Entry" : "Add Time"} onBack={f.handleCancel} />

      <AlertModal
        isOpen={f.alert.show}
        type={f.alert.type}
        message={f.alert.message}
        onClose={f.dismissAlert}
      />

      <form
        key={entry ? `entry-${entry.id}` : "new"}
        onSubmit={f.handleSubmit}
        className="flex-1 flex flex-col"
      >
        <div className="flex-1 py-8 px-4">
          <div className="flex flex-col gap-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Select
                label="Project"
                options={f.projectOptions}
                value={f.projectId}
                onValueChange={f.setProjectId}
                fullWidth
              />
              <Select
                label="Task"
                placeholder="Select task"
                options={f.taskOptions}
                value={f.taskId}
                onValueChange={f.setTaskId}
                disabled={!f.projectId}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Select
                label="Customer"
                placeholder="Select customer (required if billable)"
                options={f.customerOptions}
                value={f.customerId}
                onValueChange={f.setCustomerId}
                disabled={!!f.projectId}
                fullWidth
              />
              {!f.projectId && (
                <Input
                  type="text"
                  name="project"
                  label="Project (free text)"
                  defaultValue={entry?.project || ""}
                  fullWidth
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                type="date"
                name="date"
                label="Date"
                defaultValue={toDateInput(entry?.date)}
                required
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Input
                type="time"
                label="Start Time"
                value={f.startTime}
                onChange={(e) => f.setStartTime(e.target.value)}
                required
                fullWidth
              />
              <Input
                type="time"
                label="End Time"
                value={f.endTime}
                onChange={(e) => f.setEndTime(e.target.value)}
                required
                fullWidth
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                label="Hourly Rate"
                placeholder="0.00"
                value={f.hourlyRate}
                onChange={(e) => f.setHourlyRate(e.target.value)}
                fullWidth
              />
            </div>

            <p className="text-sm text-slate-500">
              {f.preview
                ? `Duration ${formatDuration(f.preview.minutes)} · Estimated amount ${formatMoney(f.preview.amount)} (final amount is calculated when saved)`
                : "Enter a start and end time to see the duration."}
            </p>

            <Textarea
              name="description"
              label="Description"
              defaultValue={entry?.description || ""}
              rows={3}
              fullWidth
            />

            <Checkbox
              label="Billable"
              description="Billable time can be converted into an invoice."
              checked={f.billable}
              onChange={(e) => f.setBillable(e.target.checked)}
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 py-4 px-4 flex justify-start gap-3 z-10">
          <Button type="button" variant="ghost" size="md" onClick={f.handleCancel} disabled={f.saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" loading={f.saving} disabled={f.saving}>
            {f.isEdit ? "Update Time Entry" : "Create Time Entry"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TimeEntryForm;
