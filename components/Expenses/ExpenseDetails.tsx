"use client";

import React, { useState } from "react";
import useDocumentTitle from "@/hooks/common/useDocumentTitle";
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
  Tabs,
} from "@/components/ui";
import { ActivityList, DetailRow, DetailSection } from "@/components/ui/DetailParts";
import DetailHeader from "@/components/ui/DetailHeader";
import useRecordFromList from "@/hooks/common/useRecordFromList";
import type { Expense } from "@/types/expense";
import useBatchDelete from "@/hooks/common/useBatchDelete";
import { SWR_KEYS, invalidateExpenses, invalidateExpensesAndInvoices } from "@/lib/swr";
import { statusVariant } from "@/lib/statusVariants";
import { customerLabel, formatDate, formatMoney } from "@/lib/format";
import { FileQuestion } from "lucide-react";

const ExpenseDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { record: expense, loading, notFound, refetch } = useRecordFromList<Expense>({
    id: params?.id,
    listKey: SWR_KEYS.expenses,
    collection: "expenses",
    singleField: "expense",
  });
  useDocumentTitle(expense ? `${expense.expenseNumber} | Expense Details` : undefined);
  const [converting, setConverting] = useState(false);
  const [tab, setTab] = useState<"overview" | "activity">("overview");

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

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <Tabs
          tabs={[
            { label: "Overview", value: "overview" },
            { label: "Activity", value: "activity" },
          ]}
          activeTab={tab}
          onTabChange={(v) => setTab(v as "overview" | "activity")}
        />
      </div>

      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
            <DetailRow label="Expense #">{expense.expenseNumber}</DetailRow>
            <DetailRow label="Status">{expense.status}</DetailRow>
            <DetailRow label="Date">{formatDate(expense.expenseDate)}</DetailRow>
            <DetailRow label="Category">{expense.category?.name}</DetailRow>
            <DetailRow label="Vendor">{expense.vendor}</DetailRow>
            <DetailRow label="Customer">
              {expense.customer && (
                <Link href={`/customers/${expense.customer.id}`} className="text-primary hover:underline">
                  {customerLabel(expense.customer)}
                </Link>
              )}
            </DetailRow>
            <DetailRow label="Billable">{expense.billable ? "Yes" : "No"}</DetailRow>
            <DetailRow label="Invoice">
              {expense.invoice && (
                <Link href={`/invoices/${expense.invoice.id}`} className="text-primary hover:underline">
                  {expense.invoice.invoiceNumber}
                </Link>
              )}
            </DetailRow>
            <DetailRow label="Payment Method">{expense.paymentMethod}</DetailRow>
            <DetailRow label="Reference Number">{expense.referenceNumber}</DetailRow>
          </div>

          <DetailSection title="Description">
            <p className="py-1 text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
              {expense.description || <span className="text-slate-400">-</span>}
            </p>
          </DetailSection>

          <DetailSection title="Amount Breakdown">
            <DetailRow label="Amount">
              {formatMoney(expense.amount)} {expense.currency}
            </DetailRow>
            <DetailRow label={`Tax (${expense.taxPercent || 0}%)`}>
              {formatMoney(expense.tax)} {expense.currency}
            </DetailRow>
            <DetailRow label="Total">
              {formatMoney(expense.total)} {expense.currency}
            </DetailRow>
          </DetailSection>

          <DetailSection title="Attachment & Notes">
            <DetailRow label="Attachment">
              {expense.attachment && (
                <a href={expense.attachment} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  View attachment
                </a>
              )}
            </DetailRow>
            <DetailRow label="Notes">{expense.notes}</DetailRow>
          </DetailSection>
        </div>
      )}

      {tab === "activity" && (
        <div>
          <h3 className="mb-4 text-base font-medium text-slate-900">Activity</h3>
          <ActivityList
            entries={[
              { label: "Expense recorded", at: expense.createdAt },
              { label: expense.invoiced ? "Invoiced" : "Last updated", at: expense.updatedAt },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default ExpenseDetails;
