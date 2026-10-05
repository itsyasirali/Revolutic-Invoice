"use client";

import React from "react";
import { useInvoiceListMenu } from "@/hooks/common/listMenus";
import { useParams } from "next/navigation";
import { AlertModal, Button, ConfirmDialog } from "@/components/ui";
import SplitView from "@/components/ui/SplitView";
import InvoiceDetails from "./InvoiceDetails";
import useInvoiceList from "@/hooks/invoices/useInvoiceList";

const STATUSES = ["All", "Draft", "Sent", "Paid", "Overdue", "Partially Paid", "Written Off"];
const FILTERS = STATUSES.map((s) => ({ value: s, label: s === "All" ? "All Invoices" : `${s} Invoices` }));

const InvoiceSplitView = ({ initialInvoices }: { initialInvoices?: any[] }) => {
  const selectedId = useParams<{ id?: string }>()?.id;
  const list = useInvoiceList(initialInvoices as never);
  const listMenu = useInvoiceListMenu(list.filteredInvoices);

  return (
    <>
      <AlertModal isOpen={list.alert.show} type={list.alert.type} message={list.alert.message} onClose={list.dismissAlert} />
      <ConfirmDialog
        isOpen={list.confirmDialog.show}
        title="Delete Invoices"
        message={`Are you sure you want to delete ${list.confirmDialog.selectedIds.length} invoice(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={list.confirmDelete}
        onCancel={list.hideConfirmDialog}
      />
      <SplitView
        filter={{ value: list.statusFilter, options: FILTERS, onChange: list.setStatusFilter }}
        rows={listMenu.rows.map((inv) => ({
          id: inv.id,
          title: inv.invoice,
          subtitle: inv.name || undefined,
          right: `${inv.amount || "0.00"} ${inv.currency || "PKR"}`,
        }))}
        loading={list.loading}
        selectedId={selectedId}
        onOpen={(id) => {
          const inv = list.filteredInvoices.find((x) => String(x.id) === String(id));
          if (inv) list.handleRowClick(inv);
        }}
        onNew={list.handleNew}
        newLabel="New invoice"
        moreMenu={listMenu.menu}
        selectedIds={list.selectedIds}
        onSelectRow={list.onSelectRow}
        emptyText="No invoices found"
        detailKey={selectedId}
        bulk={
          <Button size="xs" variant="danger" onClick={() => list.handleDelete()} disabled={list.loading}>
            Delete
          </Button>
        }
      >
        <InvoiceDetails />
      </SplitView>
    </>
  );
};

export default InvoiceSplitView;
