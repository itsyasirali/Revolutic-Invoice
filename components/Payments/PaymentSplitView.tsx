"use client";

import React from "react";
import { usePaymentListMenu } from "@/hooks/common/listMenus";
import { useParams } from "next/navigation";
import { AlertModal, Button, ConfirmDialog } from "@/components/ui";
import SplitView from "@/components/ui/SplitView";
import PaymentDetails from "./PaymentDetails";
import PaymentPreview from "./PaymentPreview";
import usePaymentsList, { PAYMENT_MODE_FILTERS } from "@/hooks/payments/usePaymentsList";
import usePaymentActions from "@/hooks/payments/usePaymentActions";
import { formatMoney } from "@/lib/format";
import type { Payment } from "@/types/payment";

const FILTERS = PAYMENT_MODE_FILTERS.map((m) => ({
  value: m,
  label: m === "All" ? "All Payments" : `${m} Payments`,
}));

const PaymentSplitView = ({ initialPayments, preview = false }: { initialPayments?: Payment[]; preview?: boolean }) => {
  const selectedId = useParams<{ id?: string }>()?.id;
  const list = usePaymentsList(initialPayments as never);
  const listMenu = usePaymentListMenu(list.payments);
  const { handleRowClick } = usePaymentActions();
  const busy = list.loading || list.deleting;

  return (
    <>
      <AlertModal
        isOpen={list.alert?.show || false}
        type={list.alert?.type || "info"}
        message={list.alert?.message || ""}
        onClose={list.dismissAlert}
      />
      <ConfirmDialog
        isOpen={list.confirmDialog?.show || false}
        title="Delete Payments"
        message={`Are you sure you want to delete ${list.confirmDialog?.selectedIds?.length} payment(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={list.confirmDelete}
        onCancel={list.hideConfirmDialog}
      />
      <SplitView
        filter={{
          value: list.modeFilter,
          options: FILTERS,
          onChange: (v) => list.setModeFilter(v as Parameters<typeof list.setModeFilter>[0]),
        }}
        rows={listMenu.rows.map((p) => ({
          id: p.id,
          title: `Payment ${p.paymentNumber ?? ""}`.trim(),
          subtitle: p.customerDisplayName || undefined,
          right: `${p.currency || "PKR"} ${formatMoney(p.amountReceived)}`,
        }))}
        loading={list.loading}
        selectedId={selectedId}
        onOpen={(id) => {
          const p = list.payments.find((x) => String(x.id) === String(id));
          if (p) handleRowClick(String(p.id), p);
        }}
        onNew={list.handleNew}
        newLabel="New payment"
        moreMenu={listMenu.menu}
        selectedIds={list.selectedIds}
        onSelectRow={list.onSelectRow}
        emptyText="No payments found"
        detailKey={selectedId}
        bulk={
          <Button size="xs" variant="danger" onClick={list.handleDeleteSelected} disabled={busy}>
            Delete
          </Button>
        }
      >
        {preview ? <PaymentPreview embedded /> : <PaymentDetails />}
      </SplitView>
    </>
  );
};

export default PaymentSplitView;
