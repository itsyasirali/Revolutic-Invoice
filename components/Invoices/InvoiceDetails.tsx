"use client";

import React from "react";
import { invoiceEditable } from "@/lib/editLock";
import useDocumentTitle from "@/hooks/common/useDocumentTitle";
import { OrgLink as Link } from "@/components/organization/OrgLink";
import {
  ScrollText,
  RotateCcw,
} from "lucide-react";
import { Table, StatusBadge, Button, ConfirmDialog, Tabs } from "@/components/ui";
import { ActivityList, DetailRow, DetailSection } from "@/components/ui/DetailParts";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import useDeleteInvoices from "@/hooks/invoices/useDeleteInvoices";
import useCloneInvoice from "@/hooks/invoices/useCloneInvoice";
import WriteOffModal from "./WriteOffModal";
import DetailHeader from "@/components/ui/DetailHeader";
import useInvoiceDetails from "@/hooks/invoices/useInvoiceDetails";
import type { Invoice } from "@/types/invoice";
import usePlaceholderResolver from "@/hooks/common/usePlaceholderResolver";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import type { TableColumn } from "@/types/common";
import BusinessPortalComments from "@/components/portal/BusinessPortalComments";

const NON_WRITE_OFF_STATUSES = ["draft", "paid", "cancelled", "written off"];

const InvoiceDetails: React.FC = () => {
  const {
    mounted,
    invoice,
    handleSend,
    handleEdit,
    handlePreviewPdf,
    invoiceNumberDisplay,
    currency,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    issueDateFormatted,
    dueDateFormatted,
    subtotal,
    discountPercent,
    discountAmount,
    total,
    amountPaid,
    totalWrittenOff,
    balanceDue,
    statusText,
    statusVariant,
    writeOffTarget,
    writeOffLoading,
    openWriteOff,
    closeWriteOff,
    submitWriteOff,
    reverseWriteOff,
  } = useInvoiceDetails();
  const { resolve } = usePlaceholderResolver("invoice", invoice);
  useDocumentTitle(invoice ? `${invoiceNumberDisplay} | Invoice Details` : undefined);
  const router = useRouter();
  const deleteHook = useDeleteInvoices();
  const { cloneInvoice, cloning } = useCloneInvoice();
  const [tab, setTab] = React.useState<"overview" | "comments" | "activity">("overview");

  const columns: TableColumn<Invoice["items"][0]>[] = [
    {
      key: "item",
      label: "ITEM DETAILS",
      render: (item) => (
        <div className="space-y-0.5">
          <p className="font-bold text-slate-900 text-sm">
            {item.title || item.name || "Unnamed Item"}
          </p>
          {item.description && (
            <p className="text-xs text-slate-500 line-clamp-2">
              {resolve(item.description)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "quantity",
      label: "QTY",
      align: "center" as const,
      render: (item) => (
        <span className="font-semibold text-slate-700">
          {item.quantity}{" "}
          {item.unit ? (
            <span className="text-slate-400 text-xs font-normal">
              {item.unit}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: "rate",
      label: "RATE",
      align: "right" as const,
      render: (item) => (
        <span className="font-semibold text-slate-700">
          {currency}{" "}
          {(Number(item.rate) || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: "amount",
      label: "AMOUNT",
      align: "right" as const,
      render: (item) => (
        <span className="font-bold text-slate-900">
          {currency}{" "}
          {(Number(item.amount) || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
  ];

  if (!mounted || !invoice) {
    return null;
  }

  const money = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const canWriteOff = !NON_WRITE_OFF_STATUSES.includes(
    statusText.toLowerCase(),
  );
  const activeWriteOffs = (invoice.writeOffs || []).filter(
    (w: any) => !w.reversedAt,
  );
  const reversedWriteOffs = (invoice.writeOffs || []).filter(
    (w: any) => !!w.reversedAt,
  );

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 py-2">
      <WriteOffModal
        isOpen={!!writeOffTarget}
        invoiceLabel={writeOffTarget?.invoice || invoiceNumberDisplay}
        remainingAmount={writeOffTarget?.amount ?? balanceDue}
        currency={currency}
        loading={writeOffLoading}
        onCancel={closeWriteOff}
        onConfirm={submitWriteOff}
      />
      <ConfirmDialog
        isOpen={deleteHook.confirmDialog.show}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={deleteHook.confirmDelete}
        onCancel={deleteHook.hideConfirmDialog}
      />

      <DetailHeader
        title={invoiceNumberDisplay}
        subtitle={<StatusBadge status={statusText} variant={statusVariant} />}
        onEdit={invoiceEditable(statusText) ? handleEdit : undefined}
        editTitle="Edit invoice"
        onClose={() => router.push("/invoices")}
        menu={[
          { label: "Send Invoice", onClick: handleSend },
          { label: "Preview PDF", onClick: handlePreviewPdf },
          { label: "Clone", disabled: cloning, hidden: !invoice.id, onClick: () => cloneInvoice(invoice) },
          {
            label: "Write Off",
            hidden: !canWriteOff,
            onClick: () =>
              openWriteOff({
                id: invoice.id,
                invoice: invoiceNumberDisplay,
                amount: balanceDue,
              }),
          },
          {
            label: "Delete",
            danger: true,
            onClick: () => deleteHook.deleteInvoices([invoice.id], () => router.push("/invoices")),
          },
        ]}
      />

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <Tabs
          tabs={[
            { label: "Overview", value: "overview" },
            { label: "Comments", value: "comments" },
            { label: "Activity", value: "activity" },
          ]}
          activeTab={tab}
          onTabChange={(v) => setTab(v as "overview" | "comments" | "activity")}
        />
      </div>

      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
            <DetailRow label="Invoice Number">{invoiceNumberDisplay}</DetailRow>
            <DetailRow label="Status">{statusText}</DetailRow>
            <DetailRow label="Customer">{customerName}</DetailRow>
            <DetailRow label="Email">{customerEmail}</DetailRow>
            <DetailRow label="Phone">{customerPhone}</DetailRow>
            <DetailRow label="Currency">{currency}</DetailRow>
            <DetailRow label="Issue Date">{issueDateFormatted}</DetailRow>
            <DetailRow label="Due Date">{dueDateFormatted}</DetailRow>
            {invoice.terms && <DetailRow label="Terms">{invoice.terms}</DetailRow>}
          </div>

          <DetailSection title="Billing Address">
            <p className="py-1 text-sm text-slate-900 leading-relaxed">{customerAddress}</p>
          </DetailSection>

          {/* Source records: quote this invoice was created from, billed expenses / time entries */}
          {(invoice.quote ||
            (invoice.expenses && invoice.expenses.length > 0) ||
            (invoice.timeEntries && invoice.timeEntries.length > 0)) && (
            <DetailSection title="Source">
              {invoice.quote && (
                <DetailRow label="Created from Quote">
                  <Link href={`/quotes/${invoice.quote.id}`} className="text-primary hover:underline">
                    {invoice.quote.quoteNumber}
                  </Link>
                </DetailRow>
              )}
              {invoice.expenses && invoice.expenses.length > 0 && (
                <DetailRow label="Expenses">
                  <span className="flex flex-wrap gap-x-3 gap-y-1">
                    {invoice.expenses.map((e: { id: number; expenseNumber: string }) => (
                      <Link key={`exp-${e.id}`} href={`/expenses/${e.id}`} className="text-primary hover:underline">
                        {e.expenseNumber}
                      </Link>
                    ))}
                  </span>
                </DetailRow>
              )}
              {invoice.timeEntries && invoice.timeEntries.length > 0 && (
                <DetailRow label="Time Entries">
                  <span className="flex flex-wrap gap-x-3 gap-y-1">
                    {invoice.timeEntries.map((t: { id: number; entryNumber: string }) => (
                      <Link key={`time-${t.id}`} href={`/time-tracking/${t.id}`} className="text-primary hover:underline">
                        {t.entryNumber}
                      </Link>
                    ))}
                  </span>
                </DetailRow>
              )}
            </DetailSection>
          )}

          <DetailSection title="Line Items">
            <Table
              columns={columns}
              data={invoice.items || []}
              showCheckbox={false}
              variant="default"
              emptyMessage="No items found in this invoice"
              emptyIcon={ScrollText}
            />

            <div className="flex justify-end pt-4">
              <dl className="w-full sm:w-80 text-sm space-y-2">
                <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{money(subtotal)}</dd></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Discount {discountPercent ? `(${discountPercent}%)` : ""}</dt>
                    <dd>- {money(discountAmount)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-base font-bold text-slate-900">
                  <dt>Total</dt>
                  <dd>{money(total)} {currency}</dd>
                </div>
                <div className="flex justify-between"><dt className="text-slate-500">Received</dt><dd>{money(amountPaid)}</dd></div>
                {totalWrittenOff > 0 && (
                  <div className="flex justify-between"><dt className="text-slate-500">Written Off</dt><dd>{money(totalWrittenOff)}</dd></div>
                )}
                <div className="flex justify-between font-bold text-slate-900">
                  <dt>Balance Due</dt>
                  <dd>{money(balanceDue)} {currency}</dd>
                </div>
              </dl>
            </div>
          </DetailSection>

          {invoice.notes && (
            <DetailSection title="Notes & Terms">
              <div
                className="text-sm text-slate-900 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(resolve(invoice.notes, true)),
                }}
              />
            </DetailSection>
          )}

          {(activeWriteOffs.length > 0 || reversedWriteOffs.length > 0) && (
            <DetailSection title="Write-off History">
              <div className="flex flex-col gap-3">
                {activeWriteOffs.map((w: any) => (
                  <div
                    key={w.id}
                    className="flex items-start justify-between gap-4 p-3 rounded-md bg-violet-50 border border-violet-200"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-violet-800">
                        {currency} {money(Number(w.amount))}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">{w.reason}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{new Date(w.writeOffDate).toLocaleString()}</p>
                    </div>
                    <Button
                      onClick={() => reverseWriteOff(invoice.id)}
                      variant="outline"
                      size="sm"
                      icon={<RotateCcw className="w-3.5 h-3.5" />}
                    >
                      Reverse
                    </Button>
                  </div>
                ))}
                {reversedWriteOffs.map((w: any) => (
                  <div
                    key={w.id}
                    className="flex items-start justify-between gap-4 p-3 rounded-md bg-slate-50 border border-slate-200 opacity-70"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-600 line-through">
                        {currency} {money(Number(w.amount))}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{w.reason}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Written off {new Date(w.writeOffDate).toLocaleDateString()} · Reversed{" "}
                        {new Date(w.reversedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}
        </div>
      )}

      {tab === "comments" && <BusinessPortalComments entityType="invoice" entityId={invoice.id} />}

      {tab === "activity" && (
        <div>
          <h3 className="mb-4 text-base font-medium text-slate-900">Activity</h3>
          <ActivityList
            entries={[
              { label: "Invoice created", at: invoice.createdAt },
              ...(invoice.writeOffs || []).flatMap((w: any) => [
                { label: `Written off ${currency} ${money(Number(w.amount))}`, at: w.writeOffDate },
                ...(w.reversedAt ? [{ label: "Write-off reversed", at: w.reversedAt }] : []),
              ]),
              { label: `Status: ${statusText}`, at: (invoice as { updatedAt?: string }).updatedAt },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default InvoiceDetails;
