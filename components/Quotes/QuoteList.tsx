"use client";

import React, { useState } from "react";
import { useQuoteListMenu } from "@/hooks/common/listMenus";
import {
  Table,
  StatusBadge,
  Button,
  PageHeader,
  ConfirmDialog,
} from "@/components/ui";
import useQuoteList from "@/hooks/quotes/useQuoteList";
import { statusVariant } from "@/lib/statusVariants";
import { customerLabel, formatDate, formatMoney } from "@/lib/format";
import { QUOTE_STATUSES } from "@/types/quote";
import type { Quote, QuoteListProps } from "@/types/quote";


const STATUS_OPTIONS = ["All", ...QUOTE_STATUSES];

const QuoteList = ({ initialQuotes }: QuoteListProps) => {
  const list = useQuoteList(initialQuotes);
  const listMenu = useQuoteListMenu(list.quotes);

  const columns = [
    {
      key: "quoteNumber",
      label: "QUOTE #",
      render: (q: Quote) => <span className="font-bold text-gray-900">{q.quoteNumber}</span>,
    },
    {
      key: "customer",
      label: "CUSTOMER",
      render: (q: Quote) => <span className="text-gray-900">{customerLabel(q.customer)}</span>,
    },
    {
      key: "quoteDate",
      label: "QUOTE DATE",
      render: (q: Quote) => <span className="text-gray-600">{formatDate(q.quoteDate)}</span>,
    },
    {
      key: "expiryDate",
      label: "EXPIRY DATE",
      render: (q: Quote) => <span className="text-gray-600">{formatDate(q.expiryDate)}</span>,
    },
    {
      key: "total",
      label: "AMOUNT",
      render: (q: Quote) => (
        <span className="text-gray-900 font-bold">
          {formatMoney(q.total)} {q.currency}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (q: Quote) => <StatusBadge status={q.status} variant={statusVariant(q.status)} />,
    },
  ];

  const selectedCount = list.selectedIds.length;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="pb-8">
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

      <PageHeader
        title={list.statusFilter === "All" ? "All Quotes" : `${list.statusFilter} Quotes`}
        showBackButton={list.statusFilter !== "All"}
        onBack={() => list.setStatusFilter("All")}
        dropdown={{
          options: STATUS_OPTIONS.map((opt) => ({ label: `${opt} Quotes`, value: opt })),
          value: list.statusFilter,
          onChange: list.setStatusFilter,
          isOpen: dropdownOpen,
          onToggle: () => setDropdownOpen(!dropdownOpen),
        }}
        actions={
          <>
            <div className="flex items-center gap-2">
              <Button onClick={list.handleNew} disabled={list.loading} variant="primary" size="sm">
                New Quote
              </Button>
            {listMenu.menu}
          </div>
          </>
        }
        actionBar={
          selectedCount > 0 ? (
            <>
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-xs">
                  {selectedCount}
                </span>
                quote{selectedCount > 1 ? "s" : ""} selected
              </div>
              <Button onClick={() => list.handleDelete()} disabled={list.loading} variant="danger" size="sm">
                Delete
              </Button>
            </>
          ) : null
        }
      />

      <div className="mt-4">
      </div>

      <div className="mt-4">
        <Table<Quote>
          columns={columns}
          data={listMenu.rows}
          selectedIds={list.selectedIds}
          onSelectAll={list.onSelectAll}
          onSelectRow={list.onSelectRow}
          loading={list.initialLoading}
          emptyMessage={list.error || "No quotes found"}
          getRowId={(q) => String(q.id)}
          onRowClick={list.handleRowClick}
          showFilter
          showCheckbox
        />
      </div>
    </div>
  );
};

export default QuoteList;
