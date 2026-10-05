"use client";

import React from "react";
import { useParams } from "next/navigation";
import { AlertModal, Button, ConfirmDialog } from "@/components/ui";
import SplitView from "@/components/ui/SplitView";
import { MENU_ITEM_CLASS } from "@/components/ui/SplitView";
import ExpenseDetails from "./ExpenseDetails";
import useExpenseList from "@/hooks/expenses/useExpenseList";
import { customerLabel, formatMoney } from "@/lib/format";

const FILTERS = ["All", "Unbilled", "Invoiced", "Non-Billable"].map((s) => ({
  value: s,
  label: s === "All" ? "All Expenses" : `${s} Expenses`,
}));

const ExpenseSplitView = () => {
  const selectedId = useParams<{ id?: string }>()?.id;
  const list = useExpenseList();

  return (
    <>
      <ConfirmDialog
        isOpen={list.confirmDialog.show}
        title="Delete Expenses"
        message={`Are you sure you want to delete ${list.confirmDialog.selectedIds.length} expense(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={list.confirmDelete}
        onCancel={list.hideConfirmDialog}
      />
      <SplitView
        filter={{ value: list.statusFilter, options: FILTERS, onChange: list.setStatusFilter }}
        rows={list.expenses.map((e) => ({
          id: e.id,
          title: e.vendor || e.category?.name || e.expenseNumber,
          subtitle: e.vendor || e.category?.name ? e.expenseNumber : customerLabel(e.customer),
          right: `${e.currency} ${formatMoney(e.total)}`,
        }))}
        loading={list.initialLoading}
        selectedId={selectedId}
        onOpen={(id) => {
          const e = list.expenses.find((x) => String(x.id) === String(id));
          if (e) list.handleRowClick(e);
        }}
        onNew={list.handleNew}
        newLabel="New expense"
        menu={(close) => (
          <button
            type="button"
            className={MENU_ITEM_CLASS}
            onClick={() => {
              close();
              list.handleExport();
            }}
          >
            Export expenses
          </button>
        )}
        selectedIds={list.selectedIds}
        onSelectRow={list.onSelectRow}
        emptyText="No expenses found"
        detailKey={selectedId}
        bulk={
          <Button size="xs" variant="danger" onClick={() => list.handleDelete()} disabled={list.loading}>
            Delete
          </Button>
        }
      >
        <ExpenseDetails />
      </SplitView>
    </>
  );
};

export default ExpenseSplitView;
