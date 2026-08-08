"use client";

import React, { useMemo } from "react";
import type { Payment } from "@/types/payment";
import usePaymentsList, {
  PAYMENT_MODE_FILTERS,
} from "@/hooks/payments/usePaymentsList";
import usePaymentActions from "@/hooks/payments/usePaymentActions";
import {
  PageHeader,
  Table,
  Button,
  StatusBadge,
  ConfirmDialog,
} from "@/components/ui";

const PaymentList: React.FC = () => {
  const { handleRowClick } = usePaymentActions();

  const {
    payments,
    loading,
    deleting,
    mutateError,
    alert,
    confirmDialog,
    modeFilter,
    setModeFilter,
    dropdownOpen,
    setDropdownOpen,
    onSelectAll,
    onSelectRow,
    handleNew,
    handleDeleteSelected,
    confirmDelete,
    hideConfirmDialog,
    dismissAlert,
    selectedIds,
    setSelectedIds,
  } = usePaymentsList();

  const busy = loading || deleting;

  const columns = useMemo(
    () => [
      {
        key: "paymentDate",
        label: "DATE",
        sortable: true,
        render: (p: Payment) => (
          <span className="text-gray-900">
            {new Date(p.paymentDate).toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        key: "paymentNumber",
        label: "PAYMENT#",
        sortable: true,
        render: (p: Payment) => (
          <span className="text-primary font-bold">
            {p.paymentNumber || ""}
          </span>
        ),
      },
      {
        key: "referenceNo",
        label: "REFERENCE NUMBER",
        sortable: true,
        render: (p: Payment) => (
          <span className="text-gray-900">{p.referenceNo || ""}</span>
        ),
      },
      {
        key: "customerDisplayName",
        label: "CUSTOMER NAME",
        sortable: true,
        render: (p: Payment) => (
          <span className="text-gray-900">{p.customerDisplayName || ""}</span>
        ),
      },
      {
        key: "paymentMode",
        label: "MODE",
        sortable: true,
        render: (p: Payment) => (
          <span className="text-gray-900">{p.paymentMode || ""}</span>
        ),
      },
      {
        key: "amountReceived",
        label: "AMOUNT",
        sortable: true,
        render: (p: Payment) => (
          <span className="text-gray-900 font-bold">
            {(p.amountReceived ?? 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {p.currency || "PKR"}
          </span>
        ),
      },
      {
        key: "status",
        label: "STATUS",
        render: (p: Payment) => <StatusBadge status={p.status || "Paid"} />,
      },
    ],
    [],
  );

  return (
    <div className="pb-8">
      <PageHeader
        title="All Payments"
        showBackButton={modeFilter !== "All"}
        onBack={() => setModeFilter("All")}
        dropdown={{
          options: PAYMENT_MODE_FILTERS.map((option) => ({
            label:
              option === "All"
                ? "All Payments"
                : option === "Cash"
                  ? "Cash Payments"
                  : option === "Bank Transfer"
                    ? "Bank Transfer Payments"
                    : option === "Bank Remittance"
                      ? "Bank Remittance Payments"
                      : option === "Cheque"
                        ? "Cheque Payments"
                        : "Other Payments",
            value: option,
          })),
          onChange: (value) =>
            setModeFilter(value as Parameters<typeof setModeFilter>[0]),
          value: modeFilter,
          isOpen: dropdownOpen,
          onToggle: () => setDropdownOpen(!dropdownOpen),
        }}
        actions={
          <Button
            onClick={handleNew}
            disabled={busy}
            variant="primary"
            size="md"
          >
            New Payment
          </Button>
        }
      />

      <ConfirmDialog
        isOpen={alert?.show || false}
        title={
          alert?.type === "success"
            ? "Success"
            : alert?.type === "error"
              ? "Error"
              : alert?.type === "warning"
                ? "Warning"
                : "Info"
        }
        message={alert?.message || ""}
        confirmText="OK"
        cancelText=""
        type={alert?.type === "error" ? "danger" : alert?.type || "info"}
        onConfirm={dismissAlert}
        onCancel={dismissAlert}
      />

      <ConfirmDialog
        isOpen={confirmDialog?.show || false}
        title="Delete Payments"
        message={`Are you sure you want to delete ${confirmDialog?.selectedIds?.length} payment(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={hideConfirmDialog}
      />

      {selectedIds.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 p-3 mt-4 rounded-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-xs">
              {selectedIds.length}
            </span>
            payment{selectedIds.length > 1 ? "s" : ""} selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDeleteSelected}
              disabled={busy}
              variant="danger"
              size="sm"
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {mutateError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-2 mx-6 mt-3">
          {mutateError}
        </div>
      )}

      <div className="mt-4">
        <Table<Payment>
          columns={columns}
          data={payments}
          selectedIds={selectedIds}
          onSelectAll={onSelectAll}
          onSelectRow={onSelectRow}
          onRowClick={(payment) => {
            handleRowClick(payment.id, payment);
          }}
          loading={busy}
          emptyMessage="No payments found"
          getRowId={(p) => p.id}
          showFilter={true}
          showCheckbox={true}
        />
      </div>
    </div>
  );
};

export default PaymentList;
