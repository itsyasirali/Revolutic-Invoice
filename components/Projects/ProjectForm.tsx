"use client";

import React from "react";
import {
  Input,
  Select,
  Textarea,
  Button,
  AlertModal,
  PageHeader,
  LoadingSpinner,
} from "@/components/ui";
import useProjectForm from "@/hooks/projects/useProjectForm";
import currencies from "@/data/CurrencyData";
import { toDateInput } from "@/lib/format";
import { BILLING_METHODS, PROJECT_STATUSES, type BillingMethod } from "@/types/project";

const currencyOptions = currencies.map((c) => ({
  label: `${c.code} - ${c.name}`,
  value: c.code,
}));

const ProjectForm: React.FC = () => {
  const f = useProjectForm();
  const project = f.project;

  if (f.isEdit && f.loading && !project) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  const fixed = f.billingMethod === "Fixed";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHeader title={f.isEdit ? "Update Project" : "New Project"} onBack={f.handleCancel} />

      <AlertModal
        isOpen={f.alert.show}
        type={f.alert.type}
        message={f.alert.message}
        onClose={f.dismissAlert}
      />

      <form
        key={project ? `project-${project.id}` : "new"}
        onSubmit={f.handleSubmit}
        className="flex-1 flex flex-col"
      >
        <div className="flex-1 py-8 px-4">
          <div className="flex flex-col gap-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                type="text"
                name="name"
                label="Project Name"
                defaultValue={project?.name || ""}
                required
                fullWidth
              />
              <Select
                label="Customer"
                placeholder="Select customer"
                options={f.customerOptions}
                value={f.customerId}
                onValueChange={f.setCustomerId}
                fullWidth
              />
            </div>

            <Textarea
              name="description"
              label="Description"
              defaultValue={project?.description || ""}
              rows={3}
              fullWidth
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Select
                label="Status"
                options={[...PROJECT_STATUSES]}
                value={f.status}
                onValueChange={f.setStatus}
                fullWidth
              />
              <Select
                label="Billing Method"
                options={[
                  { label: "Hourly (bill logged time)", value: "Hourly" },
                  { label: "Fixed price (bill one amount)", value: "Fixed" },
                ]}
                value={f.billingMethod}
                onValueChange={(v) => f.setBillingMethod(v as BillingMethod)}
                fullWidth
              />
              <Select
                name="currency"
                label="Currency"
                options={currencyOptions}
                defaultValue={f.defaultCurrency}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {fixed ? (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  name="fixedAmount"
                  label="Fixed Amount"
                  placeholder="0.00"
                  defaultValue={project?.fixedAmount ?? ""}
                  fullWidth
                />
              ) : (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  name="hourlyRate"
                  label="Default Hourly Rate"
                  placeholder="0.00"
                  defaultValue={project?.hourlyRate ?? ""}
                  fullWidth
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                type="number"
                step="0.01"
                min="0"
                name="budgetHours"
                label="Budget Hours"
                placeholder="0"
                defaultValue={project?.budgetHours ?? ""}
                fullWidth
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                name="budgetAmount"
                label="Budget Amount"
                placeholder="0.00"
                defaultValue={project?.budgetAmount ?? ""}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                type="date"
                name="startDate"
                label="Start Date"
                defaultValue={project?.startDate ? toDateInput(project.startDate) : ""}
                fullWidth
              />
              <Input
                type="date"
                name="endDate"
                label="End Date"
                defaultValue={project?.endDate ? toDateInput(project.endDate) : ""}
                fullWidth
              />
            </div>

            {!f.isEdit && (
              <Textarea
                name="tasks"
                label="Tasks"
                placeholder="One task per line"
                rows={4}
                fullWidth
              />
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 py-4 px-4 flex justify-start gap-3 z-10">
          <Button type="button" variant="ghost" size="md" onClick={f.handleCancel} disabled={f.saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" loading={f.saving} disabled={f.saving}>
            {f.isEdit ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
