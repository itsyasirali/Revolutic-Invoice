"use client";

import React from "react";
import { useCustomerListMenu } from "@/hooks/common/listMenus";
import { useParams } from "next/navigation";
import { AlertModal, Button, ConfirmDialog } from "@/components/ui";
import SplitView from "@/components/ui/SplitView";
import CustomerDetails from "./CustomerDetails";
import useCustomerList from "@/hooks/customers/useCustomerList";
import { formatMoney } from "@/lib/format";
import type { CustomerListProps } from "@/types/customer";

const FILTERS = [
  { value: "All", label: "All Customers" },
  { value: "Active", label: "Active Customers" },
  { value: "inActive", label: "Inactive Customers" },
];

const CustomerSplitView = ({ initialCustomers }: CustomerListProps) => {
  const selectedId = useParams<{ id?: string }>()?.id;
  const list = useCustomerList(initialCustomers);
  const listMenu = useCustomerListMenu(list.filteredCustomers);

  return (
    <>
      <AlertModal isOpen={list.alert.show} type={list.alert.type} message={list.alert.message} onClose={list.dismissAlert} />
      <ConfirmDialog
        isOpen={list.confirmDialog.show}
        title="Delete Customers"
        message={`Are you sure you want to delete ${list.confirmDialog.selectedIds.length} customer(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={list.confirmDelete}
        onCancel={list.hideConfirmDialog}
      />
      <SplitView
        filter={{ value: list.statusFilter, options: FILTERS, onChange: list.setStatusFilter }}
        rows={listMenu.rows.map((c) => ({
          id: c.id!,
          title: c.displayName || c.companyName || "Unnamed customer",
          subtitle: c.companyName || undefined,
          right: formatMoney(c.receivables),
          muted: c.status === "inActive",
        }))}
        loading={list.loading}
        selectedId={selectedId}
        onOpen={(id) => {
          const c = list.filteredCustomers.find((x) => String(x.id) === String(id));
          if (c) list.handleRowClick(c);
        }}
        onNew={list.handleNew}
        newLabel="New customer"
        moreMenu={listMenu.menu}
        selectedIds={list.selectedIds}
        onSelectRow={list.onSelectRow}
        emptyText="No customers found"
        detailKey={selectedId}
        bulk={
          <>
            <Button size="xs" variant="outline" onClick={list.handleSetActive} disabled={list.loading}>
              Active
            </Button>
            <Button size="xs" variant="outline" onClick={list.handleSetInactive} disabled={list.loading}>
              Inactive
            </Button>
            <Button size="xs" variant="danger" onClick={() => list.handleDelete()} disabled={list.loading}>
              Delete
            </Button>
          </>
        }
      >
        <CustomerDetails />
      </SplitView>
    </>
  );
};

export default CustomerSplitView;
