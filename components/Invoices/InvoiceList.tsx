"use client";

import { useMemo } from "react";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  Button,
  StatusBadge,
  ConfirmDialog,
  PageHeader,
} from "@/components/ui";
import useInvoiceList from "@/hooks/invoices/useInvoiceList";
import type { UIInvoiceListItem } from "@/hooks/invoices/useInvoicesData";

const InvoiceList = () => {
  const {
    filteredInvoices,
    selectedIds,
    setSelectedIds,
    statusFilter,
    setStatusFilter,
    dropdownOpen,
    setDropdownOpen,
    loading,
    alert,
    confirmDialog,
    onSelectAll,
    onSelectRow,
    handleNew,
    handleEdit,
    handleDelete,
    handleRowClick,
    confirmDelete,
    hideConfirmDialog,
    dismissAlert,
  } = useInvoiceList();

  const columns = useMemo(
    () => [
      {
        key: "invoice",
        label: "INVOICE#",
        render: (inv: UIInvoiceListItem) => (
          <span className="font-bold text-gray-900">{inv.invoice}</span>
        ),
      },
      {
        key: "name",
        label: "CUSTOMER",
        render: (inv: UIInvoiceListItem) => (
          <span className="text-gray-900">{inv.name || ""}</span>
        ),
      },
      {
        key: "email",
        label: "EMAIL",
        render: (inv: UIInvoiceListItem) => (
          <span className="text-gray-600">{inv.email || ""}</span>
        ),
      },
      {
        key: "date",
        label: "DATE",
        render: (inv: UIInvoiceListItem) => (
          <span className="text-gray-600">{inv.date || ""}</span>
        ),
      },
      {
        key: "dueDate",
        label: "DUE DATE",
        render: (inv: UIInvoiceListItem) => (
          <span className="text-gray-600">{inv.dueDate || ""}</span>
        ),
      },
      {
        key: "amount",
        label: "AMOUNT",
        render: (inv: UIInvoiceListItem) => (
          <span className="text-gray-900 font-bold">
            {inv.amount || "0.00"} {inv.currency || "PKR"}
          </span>
        ),
      },
      {
        key: "status",
        label: "STATUS",
        render: (inv: UIInvoiceListItem) => (
          <StatusBadge status={inv.status?.tooltip || "Draft"} />
        ),
      },
    ],
    [],
  );

  const statusOptions = [
    "All",
    "Draft",
    "Sent",
    "Paid",
    "Overdue",
    "Partially Paid",
  ];

  return (
    <div className="pb-8">
      <PageHeader
        title={
          statusFilter === "All" ? "All Invoices" : `${statusFilter} Invoices`
        }
        onBack={() => setStatusFilter("All")}
        dropdown={{
          options: statusOptions.map((opt) => ({
            label: `${opt} Invoices`,
            value: opt,
          })),
          value: statusFilter,
          onChange: setStatusFilter,
          isOpen: dropdownOpen,
          onToggle: () => setDropdownOpen(!dropdownOpen),
        }}
        actions={
          <Button
            onClick={handleNew}
            disabled={loading}
            variant="primary"
            size="md"
          >
            New Invoice
          </Button>
        }
      />

      <ConfirmDialog
        isOpen={alert.show}
        title={
          alert.type === "success"
            ? "Success"
            : alert.type === "error"
              ? "Error"
              : alert.type === "warning"
                ? "Warning"
                : "Info"
        }
        message={alert.message}
        confirmText="OK"
        cancelText=""
        type={alert.type === "error" ? "danger" : alert.type}
        onConfirm={dismissAlert}
        onCancel={dismissAlert}
      />

      <ConfirmDialog
        isOpen={confirmDialog.show}
        title="Delete Invoices"
        message={`Are you sure you want to delete ${confirmDialog.selectedIds.length} invoice(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={hideConfirmDialog}
      />

      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 p-3 mt-4 rounded-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-blue-700 font-medium text-sm">
            <span className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center text-xs">
              {selectedIds.length}
            </span>
            invoice{selectedIds.length > 1 ? "s" : ""} selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDelete}
              disabled={loading}
              variant="danger"
              size="sm"
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Table<UIInvoiceListItem>
          columns={columns}
          data={filteredInvoices}
          selectedIds={selectedIds}
          onSelectAll={onSelectAll}
          onSelectRow={onSelectRow}
          loading={loading}
          emptyMessage="No invoices found"
          getRowId={(i) => String(i.id)}
          onRowClick={handleRowClick}
          rowActions={(inv) => (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(inv);
                }}
                className="p-1.5 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-md cursor-pointer"
                title="Edit Invoice"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIds([String(inv.id)]);
                  handleDelete();
                }}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-md cursor-pointer"
                title="Delete Invoice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
          showFilter
          showCheckbox
        />
      </div>
    </div>
  );
};

export default InvoiceList;
