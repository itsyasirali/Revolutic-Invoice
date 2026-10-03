"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import axios from "@/lib/axios";
import { FileQuestion } from "lucide-react";
import { OrgLink as Link } from "@/components/organization/OrgLink";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import {
  Button,
  StatusBadge,
  ConfirmDialog,
  LoadingSpinner,
  EmptyState,
  toast,
} from "@/components/ui";
import { DetailBreadcrumb, InfoCard, InfoField, ActivityList } from "@/components/ui/DetailParts";
import { useTimeEntry } from "@/hooks/timeTracking/useTimeEntryForm";
import useBatchDelete from "@/hooks/common/useBatchDelete";
import { invalidateTimeEntries, invalidateTimeEntriesAndInvoices } from "@/lib/swr";
import { statusVariant } from "@/lib/statusVariants";
import { customerLabel, formatDate, formatMoney } from "@/lib/format";
import { formatDuration, userDisplayName } from "@/types/timeEntry";

const TimeEntryDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { timeEntry: entry, loading, notFound, refetch } = useTimeEntry(params?.id);
  const [converting, setConverting] = useState(false);

  const del = useBatchDelete({
    endpoint: "/time-tracking/batch-delete",
    bodyKey: "timeEntries",
    noun: "Time entry",
    invalidate: invalidateTimeEntries,
  });

  if (loading && !entry) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }
  if (!entry) {
    return (
      <div className="px-6 py-10">
        <EmptyState
          icon={FileQuestion}
          title="Time entry not found"
          message={notFound ? "It may have been deleted or belongs to another organization." : ""}
        />
      </div>
    );
  }

  const convert = async () => {
    setConverting(true);
    try {
      const res = await axios.post("/time-tracking/invoice", { timeEntryIds: [entry.id] });
      await invalidateTimeEntriesAndInvoices();
      await refetch();
      toast.success("Invoice created from this time entry", "Invoice Created");
      router.push(`/invoices/${res.data.invoice.id}`);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Failed to create invoice", "Error");
    } finally {
      setConverting(false);
    }
  };

  const currency = entry.customer?.currency || "";

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 py-2">
      <ConfirmDialog
        isOpen={del.confirmDialog.show}
        title="Delete Time Entry"
        message="Are you sure you want to delete this time entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={del.confirmDelete}
        onCancel={del.hideConfirmDialog}
      />

      <DetailBreadcrumb section="Time Tracking" href="/time-tracking" current={entry.entryNumber} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {entry.entryNumber}
            </h1>
            <StatusBadge status={entry.status} variant={statusVariant(entry.status)} />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {formatDuration(entry.duration)} · {formatDate(entry.date)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {entry.billable && !entry.invoiced && (
            <Button variant="success" size="sm" onClick={convert} loading={converting}>
              Create Invoice
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={entry.invoiced}
            onClick={() => router.push(`/time-tracking/edit/${entry.id}`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={entry.invoiced}
            onClick={() => del.requestDelete([entry.id], () => router.push("/time-tracking"))}
          >
            Delete
          </Button>
        </div>
      </div>

      <InfoCard title="Time Information">
        <InfoField label="Date">{formatDate(entry.date)}</InfoField>
        <InfoField label="Start - End">
          {entry.startTime} - {entry.endTime}
        </InfoField>
        <InfoField label="Duration">{formatDuration(entry.duration)}</InfoField>
        <InfoField label="User">{userDisplayName(entry.user)}</InfoField>
        <InfoField label="Project">{entry.project}</InfoField>
        <InfoField label="Billable">{entry.billable ? "Yes" : "No"}</InfoField>
        <InfoField label="Description" wide>
          {entry.description}
        </InfoField>
      </InfoCard>

      <InfoCard title="Billing">
        <InfoField label="Customer">
          {entry.customer && (
            <Link href={`/customers/${entry.customer.id}`} className="text-primary hover:underline">
              {customerLabel(entry.customer)}
            </Link>
          )}
        </InfoField>
        <InfoField label="Hourly Rate">
          {formatMoney(entry.hourlyRate)} {currency}
        </InfoField>
        <InfoField label="Amount">
          {formatMoney(entry.amount)} {currency}
        </InfoField>
        {entry.invoice && (
          <InfoField label="Invoice">
            <Link href={`/invoices/${entry.invoice.id}`} className="text-primary hover:underline">
              {entry.invoice.invoiceNumber}
            </Link>
          </InfoField>
        )}
      </InfoCard>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-4">Activity</h2>
        <ActivityList
          entries={[
            { label: "Time logged", at: (entry as { createdAt?: string }).createdAt },
            {
              label: entry.invoiced ? "Invoiced" : "Last updated",
              at: (entry as { updatedAt?: string }).updatedAt,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default TimeEntryDetails;
