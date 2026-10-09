"use client";

import React, { useState } from "react";
import {
  Table,
  StatusBadge,
  Button,
  PageHeader,
  ConfirmDialog,
} from "@/components/ui";
import useExpenseList from "@/hooks/expenses/useExpenseList";
import { useExpenseListMenu } from "@/hooks/common/listMenus";
import { statusVariant } from "@/lib/statusVariants";
import { customerLabel, formatDate, formatMoney } from "@/lib/format";
import type { Expense, ExpenseListProps } from "@/types/expense";

const STATUS_OPTIONS = ["All", "Unbilled", "Invoiced", "Non-Billable"];

const ExpenseList = ({ initialExpenses }: ExpenseListProps) => {
  const list = useExpenseList(initialExpenses);
  const listMenu = useExpenseListMenu(list.expenses);

  const columns = [
    {
      key: "expenseNumber",
      label: "EXPENSE #",
      render: (e: Expense) => <span className="font-bold text-gray-900">{e.expenseNumber}</span>,
    },
    {
      key: "expenseDate",
      label: "DATE",
      render: (e: Expense) => <span className="text-gray-600">{formatDate(e.expenseDate)}</span>,
    },
    {
      key: "vendor",
      label: "VENDOR",
      render: (e: Expense) => <span className="text-gray-900">{e.vendor || ""}</span>,
    },
    {
      key: "customer",
      label: "CUSTOMER",
      render: (e: Expense) => <span className="text-gray-900">{customerLabel(e.customer)}</span>,
    },
    {
      key: "category",
      label: "CATEGORY",
      render: (e: Expense) => <span className="text-gray-600">{e.category?.name || ""}</span>,
    },
    {
      key: "total",
      label: "AMOUNT",
      render: (e: Expense) => (
        <span className="text-gray-900 font-bold">
          {formatMoney(e.total)} {e.currency}
        </span>
      ),
    },
    {
      key: "billable",
      label: "BILLABLE",
      render: (e: Expense) => (
        <span className="text-gray-600">{e.billable ? "Yes" : "No"}</span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (e: Expense) => (
        <StatusBadge status={e.status} variant={statusVariant(e.status)} />
      ),
    },
  ];

  const selectedCount = list.selectedIds.length;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="pb-8">
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

      <PageHeader
        title={list.statusFilter === "All" ? "All Expenses" : `${list.statusFilter} Expenses`}
        showBackButton={list.statusFilter !== "All"}
        onBack={() => list.setStatusFilter("All")}
        dropdown={{
          options: STATUS_OPTIONS.map((opt) => ({ label: `${opt} Expenses`, value: opt })),
          value: list.statusFilter,
          onChange: list.setStatusFilter,
          isOpen: dropdownOpen,
          onToggle: () => setDropdownOpen(!dropdownOpen),
        }}
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={list.handleNew} disabled={list.loading} variant="primary" size="sm">
              New Expense
            </Button>
            {listMenu.menu}
          </div>
        }
        actionBar={
          selectedCount > 0 ? (
            <>
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-xs">
                  {selectedCount}
                </span>
                expense{selectedCount > 1 ? "s" : ""} selected
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={list.handleCreateInvoice}
                  disabled={list.loading}
                  variant="success"
                  size="sm"
                >
                  Create Invoice
                </Button>
                <Button
                  onClick={() => list.handleDelete()}
                  disabled={list.loading}
                  variant="danger"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            </>
          ) : null
        }
      />

      <div className="mt-4">
      </div>

      <div className="mt-4">
        <Table<Expense>
          columns={columns}
          data={listMenu.rows}
          selectedIds={list.selectedIds}
          onSelectAll={list.onSelectAll}
          onSelectRow={list.onSelectRow}
          loading={list.initialLoading}
          emptyMessage={list.error || "No expenses found"}
          getRowId={(e) => String(e.id)}
          onRowClick={list.handleRowClick}
          showFilter
          showCheckbox
        />
      </div>
    </div>
  );
};

export default ExpenseList;
