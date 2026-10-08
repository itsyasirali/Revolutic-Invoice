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
  FileUpload,
  LoadingSpinner,
} from "@/components/ui";
import useExpenseForm from "@/hooks/expenses/useExpenseForm";
import currencies from "@/data/CurrencyData";
import { toDateInput } from "@/lib/format";
import { PAYMENT_METHODS } from "@/types/expense";

const currencyOptions = currencies.map((c) => ({
  label: `${c.code} - ${c.name}`,
  value: c.code,
}));

const ExpenseForm: React.FC = () => {
  const f = useExpenseForm();
  const expense = f.expense;

  if (f.isEdit && f.loading && !expense) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  // Remount the uncontrolled inputs once the expense has loaded.
  const formKey = expense ? `expense-${expense.id}` : "new";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHeader title={f.isEdit ? "Update Expense" : "New Expense"} onBack={f.handleCancel} />

      <AlertModal
        isOpen={f.alert.show}
        type={f.alert.type}
        message={f.alert.message}
        onClose={f.dismissAlert}
      />

      <form key={formKey} onSubmit={f.handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 py-8 px-4">
          <div className="flex flex-col gap-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                type="date"
                name="expenseDate"
                label="Date"
                defaultValue={toDateInput(expense?.expenseDate)}
                required
                fullWidth
              />
              <Input
                type="text"
                name="vendor"
                label="Vendor"
                placeholder="Who was paid?"
                defaultValue={expense?.vendor || ""}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Select
                label="Project"
                options={f.projectOptions}
                value={f.projectId}
                onValueChange={f.setProjectId}
                fullWidth
              />
              <Select
                label="Customer"
                placeholder="Select customer (required if billable)"
                options={f.customerOptions}
                value={f.customerId}
                onValueChange={f.setCustomerId}
                disabled={!!f.projectId}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Select
                name="categoryName"
                label="Category"
                placeholder="Select category"
                options={[{ label: "No category", value: "" }, ...f.categories.map((c) => ({ label: c.name, value: c.name }))]}
                defaultValue={expense?.category?.name || ""}
                fullWidth
              />
              <Input
                type="text"
                name="newCategory"
                label="New Category"
                placeholder="Or type a new category"
                fullWidth
              />
            </div>

            <Textarea
              name="description"
              label="Description"
              placeholder="What was this expense for?"
              defaultValue={expense?.description || ""}
              rows={3}
              fullWidth
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Input
                type="number"
                step="0.01"
                min="0"
                name="amount"
                label="Amount"
                placeholder="0.00"
                defaultValue={expense?.amount ?? ""}
                required
                fullWidth
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                name="taxPercent"
                label="Tax (%)"
                placeholder="0"
                defaultValue={expense?.taxPercent ?? ""}
                fullWidth
              />
              <Select
                name="currency"
                label="Currency"
                options={currencyOptions}
                defaultValue={expense?.currency || "PKR"}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Select
                name="paymentMethod"
                label="Payment Method"
                placeholder="Select method"
                options={[...PAYMENT_METHODS]}
                defaultValue={expense?.paymentMethod || ""}
                fullWidth
              />
              <Input
                type="text"
                name="referenceNumber"
                label="Reference Number"
                defaultValue={expense?.referenceNumber || ""}
                fullWidth
              />
            </div>

            <Checkbox
              label="Billable to customer"
              description="Billable expenses can be converted into an invoice."
              checked={f.billable}
              onChange={(e) => f.setBillable(e.target.checked)}
            />

            <Textarea
              name="notes"
              label="Notes"
              defaultValue={expense?.notes || ""}
              rows={3}
              fullWidth
            />

            <FileUpload
              name="attachment"
              label="Attachment"
              hint="Receipt or supporting file"
              currentUrl={expense?.attachment}
              currentLabel="View current attachment"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 py-4 px-4 flex justify-start gap-3 z-10">
          <Button type="button" variant="ghost" size="md" onClick={f.handleCancel} disabled={f.saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" loading={f.saving} disabled={f.saving}>
            {f.isEdit ? "Update Expense" : "Create Expense"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
