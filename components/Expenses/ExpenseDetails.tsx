"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import axios from "@/lib/axios";
import { OrgLink as Link } from "@/components/organization/OrgLink";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import {
  StatusBadge,
  ConfirmDialog,
  LoadingSpinner,
  EmptyState,
  toast,
} from "@/components/ui";
import { InfoCard, InfoField, ActivityList } from "@/components/ui/DetailParts";
import DetailHeader from "@/components/ui/DetailHeader";
import useExpense from "@/hooks/expenses/useExpense";
import useBatchDelete from "@/hooks/common/useBatchDelete";
import { invalidateExpenses, invalidateExpensesAndInvoices } from "@/lib/swr";
import { statusVariant } from "@/lib/statusVariants";
import { customerLabel, formatDate, formatMoney } from "@/lib/format";
import { FileQuestion } from "lucide-react";

const ExpenseDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { expense, loading, notFound, refetch } = useExpense(params?.id);
  const [converting, setConverting] = useState(false);

  const del = useBatchDelete({
    endpoint: "/expenses/batch-delete",
    bodyKey: "expenses",
    noun: "Expense",
    invalidate: invalidateExpenses,
  });

  if (loading && !expense) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }
  if (!expense) {
    return (
      <div className="px-6 py-10">
        <EmptyState
          icon={FileQuestion}
          title="Expense not found"
          message={notFound ? "It may have been deleted or belongs to another organization." : ""}
        />
      </div>
    );
  }

  const canConvert = expense.billable && !expense.invoiced;

  const convert = async () => {
    setConverting(true);
    try {
      const res = await axios.post("/expenses/invoice", { expenseIds: [expense.id] });
      await invalidateExpensesAndInvoices();
      await refetch();
      toast.success("Invoice created from this expense", "Invoice Created");
      router.push(`/invoices/${res.data.invoice.id}`);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Failed to create invoice", "Error");
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 py-2">
      <ConfirmDialog
        isOpen={del.confirmDialog.show}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={del.confirmDelete}
        onCancel={del.hideConfirmDialog}
      />

      <DetailHeader
        title={expense.expenseNumber}
        subtitle={
          <>
            <StatusBadge status={expense.status} variant={statusVariant(expense.status)} />
            <span>
              {formatMoney(expense.total)} {expense.currency} · {formatDate(expense.expenseDate)}
            </span>
          </>
        }
        onEdit={() => router.push(`/expenses/edit/${expense.id}`)}
        editDisabled={expense.invoiced}
        editTitle={expense.invoiced ? "Invoiced expenses cannot be edited" : "Edit expense"}
        onClose={() => router.push("/expenses")}
        menu={[
          { label: "Convert to Invoice", hidden: !canConvert, disabled: converting, onClick: convert },
          {
            label: "Delete",
            danger: true,
            disabled: expense.invoiced,
            onClick: () => del.requestDelete([expense.id], () => router.push("/expenses")),
          },
        ]}
      />

      <InfoCard title="Expense Information">
        <InfoField label="Expense #">{expense.expenseNumber}</InfoField>
        <InfoField label="Date">{formatDate(expense.expenseDate)}</InfoField>
        <InfoField label="Category">{expense.category?.name}</InfoField>
        <InfoField label="Description" wide>
          {expense.description}
        </InfoField>
      </InfoCard>

      <InfoCard title="Vendor & Customer">
        <InfoField label="Vendor">{expense.vendor}</InfoField>
        <InfoField label="Customer">
          {expense.customer && (
            <Link
              href={`/customers/${expense.customer.id}`}
              className="text-primary hover:underline"
            >
              {customerLabel(expense.customer)}
            </Link>
          )}
        </InfoField>
        <InfoField label="Billable">{expense.billable ? "Yes" : "No"}</InfoField>
        {expense.invoice && (
          <InfoField label="Invoice">
            <Link href={`/invoices/${expense.invoice.id}`} className="text-primary hover:underline">
              {expense.invoice.invoiceNumber}
            </Link>
          </InfoField>
        )}
      </InfoCard>

      <InfoCard title="Amount Breakdown">
        <InfoField label="Amount">
          {formatMoney(expense.amount)} {expense.currency}
        </InfoField>
        <InfoField label={`Tax (${expense.taxPercent || 0}%)`}>
          {formatMoney(expense.tax)} {expense.currency}
        </InfoField>
        <InfoField label="Total">
          {formatMoney(expense.total)} {expense.currency}
        </InfoField>
      </InfoCard>

      <InfoCard title="Payment Information" columns={2}>
        <InfoField label="Payment Method">{expense.paymentMethod}</InfoField>
        <InfoField label="Reference Number">{expense.referenceNumber}</InfoField>
      </InfoCard>

      <InfoCard title="Attachment & Notes" columns={2}>
        <InfoField label="Attachment">
          {expense.attachment && (
            <a
              href={expense.attachment}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              View attachment
            </a>
          )}
        </InfoField>
        <InfoField label="Notes">{expense.notes}</InfoField>
      </InfoCard>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-4">Activity</h2>
        <ActivityList
          entries={[
            { label: "Expense recorded", at: expense.createdAt },
            { label: expense.invoiced ? "Invoiced" : "Last updated", at: expense.updatedAt },
          ]}
        />
      </div>
    </div>
  );
};

export default ExpenseDetails;
