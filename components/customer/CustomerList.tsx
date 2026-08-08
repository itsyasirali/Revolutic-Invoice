"use client";

import React from "react";
import { Edit, Trash2, Search } from "lucide-react";
import {
  Table,
  StatusBadge,
  CurrencyDisplay,
  Button,
  PageHeader,
  ConfirmDialog,
  AlertModal,
} from "@/components/ui";
import useCustomerList from "@/hooks/customers/useCustomerList";
import type { Customer } from "@/types/customer";

const CustomerList: React.FC = () => {
  const {
    loading,
    statusFilter,
    setStatusFilter,
    dropdownOpen,
    setDropdownOpen,
    selectedIds,
    setSelectedIds,
    filteredCustomers,
    alert,
    dismissAlert,
    confirmDialog,
    confirmDelete,
    hideConfirmDialog,
    handleNew,
    handleSetActive,
    handleSetInactive,
    handleDelete,
    handleEdit,
    handleRowClick,
    onSelectAll,
    onSelectRow,
    searchQuery,
    setSearchQuery,
  } = useCustomerList();

  // Table column definitions
  const columns = [
    {
      key: "displayName",
      label: "NAME",
      render: (c: Customer) => (
        <span className="text-primary">{c.displayName || ""}</span>
      ),
    },
    {
      key: "companyName",
      label: "COMPANY NAME",
      render: (c: Customer) => (
        <span className="text-gray-900">{c.companyName || ""}</span>
      ),
    },
    {
      key: "email",
      label: "EMAIL",
      render: (c: Customer) => (
        <span className="text-gray-900">{c.contacts?.[0]?.email || ""}</span>
      ),
    },
    {
      key: "phone",
      label: "WORK PHONE",
      render: (c: Customer) => (
        <span className="text-gray-900">{c.contacts?.[0]?.contact || ""}</span>
      ),
    },
    {
      key: "remaining",
      label: "REMAINING",
      render: (c: Customer) => (
        <CurrencyDisplay
          amount={c.receivables || 0}
          currency={c.currency}
          className="text-gray-900"
        />
      ),
    },
    {
      key: "received",
      label: "RECEIVED",
      render: (c: Customer) => (
        <CurrencyDisplay
          amount={c.unusedCredits || 0}
          currency={c.currency}
          className="text-gray-900"
        />
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (c: Customer) => <StatusBadge status={c.status || "Active"} />,
    },
  ];

  return (
    <div className="pb-8">
      <AlertModal
        isOpen={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={dismissAlert}
      />

      <ConfirmDialog
        isOpen={confirmDialog.show}
        title="Delete Customers"
        message={`Are you sure you want to delete ${confirmDialog.selectedIds.length} customer(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={hideConfirmDialog}
      />

      <PageHeader
        title={
          statusFilter === "All"
            ? "All Customers"
            : statusFilter === "Active"
              ? "Active Customers"
              : "Inactive Customers"
        }
        showBackButton={statusFilter !== "All"}
        onBack={() => setStatusFilter("All")}
        dropdown={{
          options: ["All", "Active", "inActive"].map((option) => ({
            label:
              option === "All"
                ? "All Customers"
                : option === "Active"
                  ? "Active Customers"
                  : "Inactive Customers",
            value: option,
          })),
          value: statusFilter,
          onChange: (value) => setStatusFilter(value),
          isOpen: dropdownOpen,
          onToggle: () => setDropdownOpen(!dropdownOpen),
        }}
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64"
              />
            </div>
            <Button
              onClick={handleNew}
              disabled={loading}
              variant="primary"
              size="md"
            >
              New Customer
            </Button>
          </div>
        }
      />

      {selectedIds.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 p-3  mt-4 rounded-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-xs">
              {selectedIds.length}
            </span>
            customer{selectedIds.length > 1 ? "s" : ""} selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSetActive}
              disabled={loading}
              variant="success"
              size="sm"
            >
              Mark Active
            </Button>
            <Button
              onClick={handleSetInactive}
              disabled={loading}
              variant="warning"
              size="sm"
            >
              Mark Inactive
            </Button>
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
        <Table
          columns={columns}
          data={filteredCustomers}
          selectedIds={selectedIds}
          onSelectAll={onSelectAll}
          onSelectRow={onSelectRow}
          loading={loading}
          emptyMessage="No customers found"
          getRowId={(c) => c.id!}
          onRowClick={(item) => handleRowClick(item)}
          rowActions={(c) => (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(c);
                }}
                className="p-1.5 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-md cursor-pointer"
                title="Edit Customer"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIds([c.id!]);
                  handleDelete();
                }}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-md cursor-pointer"
                title="Delete Customer"
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

export default CustomerList;
