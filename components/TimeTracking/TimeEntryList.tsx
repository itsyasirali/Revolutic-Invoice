"use client";

import React, { useState } from "react";
import {
  Table,
  StatusBadge,
  Button,
  PageHeader,
  ConfirmDialog,
} from "@/components/ui";
import TimerWidget from "./TimerWidget";
import useTimeEntryList from "@/hooks/timeTracking/useTimeEntryList";
import { statusVariant } from "@/lib/statusVariants";
import { customerLabel, formatDate, formatMoney } from "@/lib/format";
import { formatDuration, userDisplayName, type TimeEntry } from "@/types/timeEntry";

const STATUS_OPTIONS = ["All", "Unbilled", "Invoiced", "Non-Billable"];

const TimeEntryList = () => {
  const list = useTimeEntryList();

  const columns = [
    {
      key: "date",
      label: "DATE",
      render: (r: TimeEntry) => <span className="font-bold text-gray-900">{formatDate(r.date)}</span>,
    },
    {
      key: "user",
      label: "USER",
      render: (r: TimeEntry) => <span className="text-gray-900">{userDisplayName(r.user)}</span>,
    },
    {
      key: "customer",
      label: "CUSTOMER",
      render: (r: TimeEntry) => <span className="text-gray-900">{customerLabel(r.customer)}</span>,
    },
    {
      key: "description",
      label: "DESCRIPTION",
      render: (r: TimeEntry) => (
        <span className="text-gray-700 leading-relaxed">
          {[r.project, r.description].filter(Boolean).join(" · ")}
        </span>
      ),
    },
    {
      key: "duration",
      label: "DURATION",
      render: (r: TimeEntry) => <span className="text-gray-900">{formatDuration(r.duration)}</span>,
    },
    {
      key: "rate",
      label: "RATE",
      render: (r: TimeEntry) => <span className="text-gray-600">{formatMoney(r.hourlyRate)}/h</span>,
    },
    {
      key: "amount",
      label: "AMOUNT",
      render: (r: TimeEntry) => (
        <span className="text-gray-900 font-bold">
          {formatMoney(r.amount)} {r.customer?.currency || ""}
        </span>
      ),
    },
    {
      key: "billable",
      label: "BILLABLE",
      render: (r: TimeEntry) => <span className="text-gray-600">{r.billable ? "Yes" : "No"}</span>,
    },
    {
      key: "invoiced",
      label: "INVOICED",
      render: (r: TimeEntry) => (
        <StatusBadge status={r.status} variant={statusVariant(r.status)} />
      ),
    },
  ];

  const selectedCount = list.selectedIds.length;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="pb-8">
      <ConfirmDialog
        isOpen={list.confirmDialog.show}
        title="Delete Time Entries"
        message={`Are you sure you want to delete ${list.confirmDialog.selectedIds.length} time entr${list.confirmDialog.selectedIds.length === 1 ? "y" : "ies"}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={list.confirmDelete}
        onCancel={list.hideConfirmDialog}
      />

      <PageHeader
        title={list.statusFilter === "All" ? "All Time Entries" : `${list.statusFilter} Time Entries`}
        showBackButton={list.statusFilter !== "All"}
        onBack={() => list.setStatusFilter("All")}
        dropdown={{
          options: STATUS_OPTIONS.map((opt) => ({ label: `${opt} Time Entries`, value: opt })),
          value: list.statusFilter,
          onChange: list.setStatusFilter,
          isOpen: dropdownOpen,
          onToggle: () => setDropdownOpen(!dropdownOpen),
        }}
        actions={
          <>
            <Button onClick={list.handleNew} disabled={list.loading} variant="primary" size="sm">
              Add Time
            </Button>
          </>
        }
        actionBar={
          selectedCount > 0 ? (
            <>
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-xs">
                  {selectedCount}
                </span>
                entr{selectedCount > 1 ? "ies" : "y"} selected
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={list.handleCreateInvoice} disabled={list.loading} variant="success" size="sm">
                  Create Invoice
                </Button>
                <Button onClick={() => list.handleDelete()} disabled={list.loading} variant="danger" size="sm">
                  Delete
                </Button>
              </div>
            </>
          ) : null
        }
      />

      <div className="mt-4 space-y-4">
        <TimerWidget />
      </div>

      <div className="mt-4">
        <Table<TimeEntry>
          columns={columns}
          data={list.entries}
          selectedIds={list.selectedIds}
          onSelectAll={list.onSelectAll}
          onSelectRow={list.onSelectRow}
          loading={list.initialLoading}
          emptyMessage={list.error || "No time entries found"}
          getRowId={(r) => String(r.id)}
          onRowClick={list.handleRowClick}
          showFilter
          showCheckbox
        />
      </div>
    </div>
  );
};

export default TimeEntryList;
