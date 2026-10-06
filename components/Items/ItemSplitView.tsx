"use client";

import React, { useEffect, useState } from "react";
import useDocumentTitle from "@/hooks/common/useDocumentTitle";
import { useItemListMenu } from "@/hooks/common/listMenus";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { OrgLink as Link } from "@/components/organization/OrgLink";
import SplitView from "@/components/ui/SplitView";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import {
  AlertModal,
  Button,
  ConfirmDialog,
  LoadingSpinner,
  StatusBadge,
} from "@/components/ui";
import useItemList from "@/hooks/items/useItemList";
import useDeleteItems from "@/hooks/items/useItemsDelete";
import useUpdateItemStatus from "@/hooks/items/useItemUpdateStatus";
import { swrFetcher } from "@/lib/swr";
import DetailHeader from "@/components/ui/DetailHeader";
import { DetailRow, DetailSection } from "@/components/ui/DetailParts";
import { setNavState } from "@/lib/clientNavState";
import { formatDate, formatMoney } from "@/lib/format";
import type { Item } from "@/types/item";

type Tab = "Overview" | "Transactions" | "History";
const TABS: Tab[] = ["Overview", "Transactions", "History"];

const FILTERS = [
  { value: "All", label: "All Items" },
  { value: "Active", label: "Active Items" },
  { value: "inActive", label: "Inactive Items" },
];

interface Transaction {
  key: string;
  type: "Invoice" | "Quote";
  id: number;
  number: string;
  date: string;
  status: string;
  currency: string;
  customer: string;
  quantity: number;
  rate: number;
  amount: number;
}

const Transactions: React.FC<{ itemId: number }> = ({ itemId }) => {
  const { data, isLoading } = useSWR<{ transactions: Transaction[] }>(
    `/items/${itemId}/transactions`,
    swrFetcher,
    { revalidateOnFocus: false },
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }
  const rows = data?.transactions ?? [];
  if (rows.length === 0) {
    return <p className="py-16 text-center text-sm text-slate-500">This item is not used in any invoice or quote yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Type</th>
            <th className="py-2 pr-4">Number</th>
            <th className="py-2 pr-4">Customer</th>
            <th className="py-2 pr-4 text-right">Qty</th>
            <th className="py-2 pr-4 text-right">Rate</th>
            <th className="py-2 pr-4 text-right">Amount</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.key} className="border-b border-slate-100">
              <td className="py-2.5 pr-4 whitespace-nowrap text-slate-600">{formatDate(t.date)}</td>
              <td className="py-2.5 pr-4 text-slate-600">{t.type}</td>
              <td className="py-2.5 pr-4">
                <Link
                  href={t.type === "Invoice" ? `/invoices/${t.id}` : `/quotes/${t.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {t.number}
                </Link>
              </td>
              <td className="py-2.5 pr-4 text-slate-800">{t.customer}</td>
              <td className="py-2.5 pr-4 text-right">{t.quantity}</td>
              <td className="py-2.5 pr-4 text-right">{formatMoney(t.rate)}</td>
              <td className="py-2.5 pr-4 text-right font-medium">
                {t.currency} {formatMoney(t.amount)}
              </td>
              <td className="py-2.5">
                <StatusBadge status={t.status} size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ItemSplitView: React.FC<{ initialItems?: Item[] }> = ({ initialItems }) => {
  const params = useParams<{ id?: string }>();
  const selectedId = params?.id;
  const router = useRouter();

  const list = useItemList(initialItems);
  const listMenu = useItemListMenu(list.filteredItems);
  const single = useDeleteItems();
  const statusUpdate = useUpdateItemStatus();

  const [tab, setTab] = useState<Tab>("Overview");


  // Back to Overview when another item is opened.
  useEffect(() => setTab("Overview"), [selectedId]);

  const item = list.items.find((i) => String(i.id) === String(selectedId));
  useDocumentTitle(item ? `${item.name} | Item Details` : undefined);
  const busy = list.loading || single.loading || statusUpdate.loading;

  const open = (i: Item) => {
    setNavState(`item:${i.id}`, i);
    router.push(`/items/${i.id}`);
  };

  // Opens the new-item form pre-filled from this item; nothing is saved until the user saves.
  const cloneItem = () => {
    if (!item) return;
    setNavState("item:clone", {
      type: item.type,
      name: `${item.name} (Copy)`,
      unit: item.unit,
      sellingPrice: item.sellingPrice,
      description: item.description,
      status: item.status,
    });
    router.push("/items/new");
  };

  const toggleStatus = async () => {
    if (!item) return;
    await statusUpdate.updateStatus(
      [item.id],
      item.status === "inActive" ? "Active" : "inActive",
      list.refetch,
    );
  };

  const remove = () => {
    if (!item) return;
    single.deleteItems([item.id], () => router.push("/items"));
  };


  return (
    <>
      <AlertModal
        isOpen={list.alert.show || single.alert.show || statusUpdate.alert.show}
        type={(list.alert.show ? list.alert : single.alert.show ? single.alert : statusUpdate.alert).type}
        message={(list.alert.show ? list.alert : single.alert.show ? single.alert : statusUpdate.alert).message}
        onClose={() => {
          list.dismissAlert();
          single.dismissAlert();
          statusUpdate.dismissAlert();
        }}
      />
      <ConfirmDialog
        isOpen={list.confirmDialog.show}
        title="Delete Items"
        message={`Are you sure you want to delete ${list.confirmDialog.selectedIds.length} item(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={list.confirmDelete}
        onCancel={list.hideConfirmDialog}
      />
      <ConfirmDialog
        isOpen={single.confirmDialog.show}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={single.confirmDelete}
        onCancel={single.hideConfirmDialog}
      />

      <SplitView
        filter={{
          value: list.statusFilter,
          options: FILTERS,
          onChange: list.setStatusFilter,
        }}
        rows={listMenu.rows.map((i) => ({
          id: i.id,
          title: i.name,
          right: `PKR${formatMoney(i.sellingPrice)}`,
          muted: i.status === "inActive",
        }))}
        loading={list.loading}
        selectedId={selectedId}
        onOpen={(id) => {
          const i = list.items.find((x) => String(x.id) === String(id));
          if (i) open(i);
        }}
        onNew={list.handleNew}
        newLabel="New item"
        moreMenu={listMenu.menu}
        selectedIds={list.selectedIds}
        onSelectRow={list.onSelectRow}
        emptyText="No items found"
        detailKey={selectedId}
        bulk={
          <>
            <Button size="xs" variant="outline" onClick={list.handleSetActive} disabled={busy}>
              Active
            </Button>
            <Button size="xs" variant="outline" onClick={list.handleSetInactive} disabled={busy}>
              Inactive
            </Button>
            <Button size="xs" variant="danger" onClick={() => list.handleDelete()} disabled={busy}>
              Delete
            </Button>
          </>
        }
      >
        {!item ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            {list.loading ? <LoadingSpinner /> : "Item not found."}
          </div>
        ) : (
          <>
            <div className="px-6 pt-5">
              <DetailHeader
                title={item.name}
                subtitle={item.status === "inActive" ? <StatusBadge status="inActive" size="sm" /> : undefined}
                onEdit={() => list.handleEdit(item)}
                editTitle="Edit item"
                onClose={() => router.push("/items")}
                menu={[
                  { label: "Clone Item", onClick: cloneItem, disabled: busy },
                  {
                    label: item.status === "inActive" ? "Mark as Active" : "Mark as Inactive",
                    onClick: toggleStatus,
                    disabled: busy,
                  },
                  { label: "Delete", onClick: remove, disabled: busy, danger: true },
                ]}
              />
            </div>

            <div className="mt-4 flex gap-7 border-b border-slate-200 px-6">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`-mb-px border-b-2 pb-2.5 text-sm cursor-pointer ${
                    tab === t
                      ? "border-primary font-medium text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="px-6 py-6">
              {tab === "Overview" && (
                <>
                  <div className="space-y-1">
                    <DetailRow label="Item Type">Sales Items ({item.type === "Service" ? "Service" : "Goods"})</DetailRow>
                    {item.unit && <DetailRow label="Unit">{item.unit}</DetailRow>}
                    <DetailRow label="Created Source">User</DetailRow>
                    {item.description && <DetailRow label="Description">{item.description}</DetailRow>}
                  </div>

                  <DetailSection title="Sales Information">
                    <DetailRow label="Selling Price">PKR{formatMoney(item.sellingPrice)}</DetailRow>
                    <DetailRow label="Sales Account">Sales</DetailRow>
                  </DetailSection>

                  <DetailSection title="Reporting Tags">
                    <p className="text-sm text-primary/80">No reporting tag has been associated with this item.</p>
                  </DetailSection>
                </>
              )}

              {tab === "Transactions" && <Transactions itemId={item.id} />}

              {tab === "History" && (
                <div className="space-y-1">
                  <DetailRow label="Created">{formatDate(item.createdAt) || "-"}</DetailRow>
                  <DetailRow label="Last modified">{formatDate(item.updatedAt) || "-"}</DetailRow>
                  <DetailRow label="Status">{item.status === "inActive" ? "Inactive" : "Active"}</DetailRow>
                </div>
              )}
            </div>
          </>
        )}
      </SplitView>
    </>
  );
};

export default ItemSplitView;
