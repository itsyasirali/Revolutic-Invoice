"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  StatusBadge,
  Button,
  PageHeader,
  ConfirmDialog,
  AlertModal,
} from "@/components/ui";
import useItemList from "@/hooks/items/useItemList";
import type { Item } from "@/types/item";

const ItemList: React.FC = () => {
  const {
    loading,
    statusFilter,
    setStatusFilter,
    dropdownOpen,
    setDropdownOpen,
    selectedIds,
    setSelectedIds,
    filteredItems,
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
  } = useItemList();

  // Table columns
  const columns = [
    {
      key: "name",
      label: "NAME",
      render: (i: Item) => (
        <span className="text-primary">{i.name || ""}</span>
      ),
    },
    {
      key: "unit",
      label: "UNIT",
      render: (i: Item) => (
        <span className="text-gray-900">{i.unit || ""}</span>
      ),
    },
    {
      key: "sellingPrice",
      label: "SELLING PRICE",
      render: (i: Item) => (
        <span className="text-gray-900">
          {i.sellingPrice !== undefined
            ? `${i.sellingPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : ""}
        </span>
      ),
    },
    {
      key: "description",
      label: "DESCRIPTION",
      render: (i: Item) => (
        <span className="text-gray-700 leading-relaxed">
          {i.description || ""}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (i: Item) => <StatusBadge status={i.status || "Active"} />,
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
        title="Delete Items"
        message={`Are you sure you want to delete ${confirmDialog.selectedIds.length} item(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={hideConfirmDialog}
      />

      <PageHeader
        title={
          statusFilter === "All"
            ? "All Items"
            : statusFilter === "Active"
              ? "Active Items"
              : "Inactive Items"
        }
        showBackButton={statusFilter !== "All"}
        onBack={() => setStatusFilter("All")}
        dropdown={{
          options: ["All", "Active", "inActive"].map((option) => ({
            label:
              option === "All"
                ? "All Items"
                : option === "Active"
                  ? "Active Items"
                  : "Inactive Items",
            value: option,
          })),
          value: statusFilter,
          onChange: (value) => setStatusFilter(value),
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
            New Item
          </Button>
        }
      />

      {selectedIds.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 p-3 mt-4 rounded-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-xs">
              {selectedIds.length}
            </span>
            item{selectedIds.length > 1 ? "s" : ""} selected
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
        <Table<Item>
          columns={columns}
          data={filteredItems}
          selectedIds={selectedIds}
          onSelectAll={onSelectAll}
          onSelectRow={onSelectRow}
          loading={loading}
          emptyMessage="No items found"
          getRowId={(i) => String(i.id)}
          onRowClick={handleRowClick}
          rowActions={(i) => (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(i);
                }}
                className="p-1.5 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-md cursor-pointer"
                title="Edit Item"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIds([i.id]);
                  handleDelete();
                }}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-md cursor-pointer"
                title="Delete Item"
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

export default ItemList;
