"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Button, ConfirmDialog } from "@/components/ui";
import SplitView from "@/components/ui/SplitView";
import { MENU_ITEM_CLASS } from "@/components/ui/SplitView";
import TimeEntryDetails from "./TimeEntryDetails";
import useTimeEntryList from "@/hooks/timeTracking/useTimeEntryList";
import { formatDuration } from "@/types/timeEntry";
import { customerLabel } from "@/lib/format";

const FILTERS = ["All", "Unbilled", "Invoiced", "Non-Billable"].map((s) => ({
  value: s,
  label: s === "All" ? "All Time Entries" : `${s} Time Entries`,
}));

const TimeEntrySplitView = () => {
  const selectedId = useParams<{ id?: string }>()?.id;
  const list = useTimeEntryList();

  return (
    <>
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
      <SplitView
        filter={{ value: list.statusFilter, options: FILTERS, onChange: list.setStatusFilter }}
        rows={list.entries.map((r) => ({
          id: r.id,
          title: r.project || r.description || r.entryNumber,
          subtitle: `${r.entryNumber} - ${customerLabel(r.customer)}`,
          right: formatDuration(r.duration),
        }))}
        loading={list.initialLoading}
        selectedId={selectedId}
        onOpen={(id) => {
          const r = list.entries.find((x) => String(x.id) === String(id));
          if (r) list.handleRowClick(r);
        }}
        onNew={list.handleNew}
        newLabel="New time entry"
        menu={(close) => (
          <button
            type="button"
            className={MENU_ITEM_CLASS}
            onClick={() => {
              close();
              list.handleExport();
            }}
          >
            Export time entries
          </button>
        )}
        selectedIds={list.selectedIds}
        onSelectRow={list.onSelectRow}
        emptyText="No time entries found"
        detailKey={selectedId}
        bulk={
          <Button size="xs" variant="danger" onClick={() => list.handleDelete()} disabled={list.loading}>
            Delete
          </Button>
        }
      >
        <TimeEntryDetails />
      </SplitView>
    </>
  );
};

export default TimeEntrySplitView;
