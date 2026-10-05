"use client";

import React from "react";
import { useQuoteListMenu } from "@/hooks/common/listMenus";
import { useParams } from "next/navigation";
import { Button, ConfirmDialog } from "@/components/ui";
import SplitView from "@/components/ui/SplitView";
import QuoteDetails from "./QuoteDetails";
import useQuoteList from "@/hooks/quotes/useQuoteList";
import { QUOTE_STATUSES } from "@/types/quote";
import { customerLabel, formatMoney } from "@/lib/format";

const FILTERS = ["All", ...QUOTE_STATUSES].map((s) => ({
  value: s,
  label: s === "All" ? "All Quotes" : `${s} Quotes`,
}));

const QuoteSplitView = () => {
  const selectedId = useParams<{ id?: string }>()?.id;
  const list = useQuoteList();
  const listMenu = useQuoteListMenu(list.quotes);

  return (
    <>
      <ConfirmDialog
        isOpen={list.confirmDialog.show}
        title="Delete Quotes"
        message={`Are you sure you want to delete ${list.confirmDialog.selectedIds.length} quote(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={list.confirmDelete}
        onCancel={list.hideConfirmDialog}
      />
      <SplitView
        filter={{ value: list.statusFilter, options: FILTERS, onChange: list.setStatusFilter }}
        rows={listMenu.rows.map((q) => ({
          id: q.id,
          title: q.quoteNumber,
          subtitle: customerLabel(q.customer),
          right: `${q.currency} ${formatMoney(q.total)}`,
        }))}
        loading={list.initialLoading}
        selectedId={selectedId}
        onOpen={(id) => {
          const q = list.quotes.find((x) => String(x.id) === String(id));
          if (q) list.handleRowClick(q);
        }}
        onNew={list.handleNew}
        newLabel="New quote"
        moreMenu={listMenu.menu}
        selectedIds={list.selectedIds}
        onSelectRow={list.onSelectRow}
        emptyText="No quotes found"
        detailKey={selectedId}
        bulk={
          <Button size="xs" variant="danger" onClick={() => list.handleDelete()} disabled={list.loading}>
            Delete
          </Button>
        }
      >
        <QuoteDetails />
      </SplitView>
    </>
  );
};

export default QuoteSplitView;
