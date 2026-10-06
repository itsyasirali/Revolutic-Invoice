"use client";

import React, { useState } from "react";
import { quoteEditable } from "@/lib/editLock";
import useDocumentTitle from "@/hooks/common/useDocumentTitle";
import { useParams } from "next/navigation";
import {
  FileQuestion,
} from "lucide-react";
import { OrgLink as Link } from "@/components/organization/OrgLink";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import {
  StatusBadge,
  ConfirmDialog,
  LoadingSpinner,
  EmptyState,
  Tabs,
} from "@/components/ui";
import { ActivityList, DetailRow, DetailSection } from "@/components/ui/DetailParts";
import DetailHeader from "@/components/ui/DetailHeader";
import { runQuoteAction } from "@/hooks/quotes/useQuote";
import useRecordFromList from "@/hooks/common/useRecordFromList";
import type { Quote } from "@/types/quote";
import { createProjectFromQuote } from "@/hooks/projects/useProject";
import useBatchDelete from "@/hooks/common/useBatchDelete";
import { SWR_KEYS, invalidateQuotes } from "@/lib/swr";
import { statusVariant } from "@/lib/statusVariants";
import { customerLabel, formatDate, formatMoney } from "@/lib/format";
import BusinessPortalComments from "@/components/portal/BusinessPortalComments";

const QuoteDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { record: quote, loading, notFound, refetch } = useRecordFromList<Quote>({
    id: params?.id,
    listKey: SWR_KEYS.quotes,
    collection: "quotes",
    singleField: "quote",
  });
  useDocumentTitle(quote ? `${quote.quoteNumber} | Quote Details` : undefined);
  const [acting, setActing] = useState(false);
  const [tab, setTab] = useState<"quote" | "comments" | "activity">("quote");

  const del = useBatchDelete({
    endpoint: "/quotes/batch-delete",
    bodyKey: "quotes",
    noun: "Quote",
    invalidate: invalidateQuotes,
  });

  if (loading && !quote) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }
  if (!quote) {
    return (
      <div className="px-6 py-10">
        <EmptyState
          icon={FileQuestion}
          title="Quote not found"
          message={notFound ? "It may have been deleted or belongs to another organization." : ""}
        />
      </div>
    );
  }

  const status = quote.status;
  const canEdit = quoteEditable(status);
  const canSend = ["Draft", "Sent", "Viewed"].includes(status);
  const canRespond = ["Sent", "Viewed"].includes(status);
  const canConvert = status === "Accepted" && !quote.convertedInvoiceId;
  const canDelete = status !== "Converted";
  const canCreateProject =
    ["Sent", "Viewed", "Accepted", "Converted"].includes(status) && !quote.projectId;
  const contact = quote.customer?.contacts?.[0];

  const act = async (action: "accept" | "decline" | "viewed" | "clone" | "convert") => {
    setActing(true);
    const data = await runQuoteAction(quote.id, action);
    setActing(false);
    if (!data) return;
    if (action === "convert" && data.invoice) router.push(`/invoices/${data.invoice.id}`);
    else await refetch();
  };

  const makeProject = async () => {
    setActing(true);
    const project = await createProjectFromQuote(quote.id);
    setActing(false);
    if (project) router.push(`/projects/${project.id}`);
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 py-2">
      <ConfirmDialog
        isOpen={del.confirmDialog.show}
        title="Delete Quote"
        message="Are you sure you want to delete this quote? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={del.confirmDelete}
        onCancel={del.hideConfirmDialog}
      />

      <DetailHeader
        title={quote.quoteNumber}
        subtitle={
          <>
            <StatusBadge status={status} variant={statusVariant(status)} />
            <span>
              {customerLabel(quote.customer)} · {formatMoney(quote.total)} {quote.currency}
            </span>
          </>
        }
        onEdit={canEdit ? () => router.push(`/quotes/edit/${quote.id}`) : undefined}
        editTitle="Edit quote"
        onClose={() => router.push("/quotes")}
        menu={[
          { label: "Send Quote", hidden: !canSend, onClick: () => router.push(`/quotes/${quote.id}/email`) },
          { label: "Convert to Invoice", hidden: !canConvert, disabled: acting, onClick: () => act("convert") },
          { label: "Create Project", hidden: !canCreateProject, disabled: acting, onClick: makeProject },
          { label: "View Project", hidden: !quote.projectId, onClick: () => router.push(`/projects/${quote.projectId}`) },
          { label: "Mark Viewed", hidden: status !== "Sent", disabled: acting, onClick: () => act("viewed") },
          { label: "Mark Accepted", hidden: !canRespond, disabled: acting, onClick: () => act("accept") },
          { label: "Mark Declined", hidden: !canRespond, disabled: acting, onClick: () => act("decline") },
          { label: "Preview", onClick: () => router.push(`/quotes/preview/${quote.id}`) },
          { label: "Download PDF", onClick: () => router.push(`/quotes/preview/${quote.id}?download=1`) },
          { label: "Clone", disabled: acting, onClick: () => router.push(`/quotes/new?clone=${quote.id}`) },
          {
            label: "Delete",
            hidden: !canDelete,
            danger: true,
            onClick: () => del.requestDelete([quote.id], () => router.push("/quotes")),
          },
        ]}
      />

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <Tabs
          tabs={[
            { label: "Overview", value: "quote" },
            { label: "Comments", value: "comments" },
            { label: "Activity", value: "activity" },
          ]}
          activeTab={tab}
          onTabChange={(v) => setTab(v as "quote" | "comments" | "activity")}
        />
      </div>

      {tab === "quote" && (
        <div>
          <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
            <DetailRow label="Quote Number">{quote.quoteNumber}</DetailRow>
            <DetailRow label="Status">{status}</DetailRow>
            <DetailRow label="Customer">
              {quote.customer ? (
                <Link href={`/customers/${quote.customer.id}`} className="text-primary hover:underline">
                  {customerLabel(quote.customer)}
                </Link>
              ) : (
                "Unnamed Customer"
              )}
            </DetailRow>
            <DetailRow label="Email">{contact?.email}</DetailRow>
            <DetailRow label="Quote Date">{formatDate(quote.quoteDate)}</DetailRow>
            <DetailRow label="Expiry Date">{formatDate(quote.expiryDate) || "None"}</DetailRow>
            <DetailRow label="Reference">{quote.referenceNumber}</DetailRow>
            <DetailRow label="Currency">{quote.currency}</DetailRow>
            {quote.projectId ? (
              <DetailRow label="Project">
                <Link href={`/projects/${quote.projectId}`} className="text-primary hover:underline">
                  View project
                </Link>
              </DetailRow>
            ) : null}
            {quote.convertedInvoice && (
              <DetailRow label="Converted Invoice">
                <Link href={`/invoices/${quote.convertedInvoice.id}`} className="text-primary hover:underline">
                  {quote.convertedInvoice.invoiceNumber}
                </Link>
              </DetailRow>
            )}
          </div>

          <DetailSection title="Address">
            <p className="py-1 text-sm text-slate-900 leading-relaxed">
              {quote.customer?.address || "No address provided"}
            </p>
          </DetailSection>

          <DetailSection title="Items">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2">Item</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    <th className="px-4 py-2 text-right">Rate</th>
                    <th className="px-4 py-2 text-right">Discount</th>
                    <th className="px-4 py-2 text-right">Tax</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-slate-700">
                  {quote.items.map((item) => (
                    <tr key={item.id ?? item.name} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-right">{Number(item.quantity)}</td>
                      <td className="px-4 py-3 text-right">{formatMoney(item.rate)}</td>
                      <td className="px-4 py-3 text-right">{Number(item.discount) || 0}%</td>
                      <td className="px-4 py-3 text-right">{Number(item.tax) || 0}%</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatMoney(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4">
              <dl className="w-full sm:w-80 text-sm space-y-2">
                <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{formatMoney(quote.subTotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Discount ({quote.discountPercent || 0}%)</dt><dd>- {formatMoney(quote.discount)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Tax (included in items)</dt><dd>{formatMoney(quote.tax)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Shipping</dt><dd>{formatMoney(quote.shipping)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Adjustment</dt><dd>{formatMoney(quote.adjustment)}</dd></div>
                <div className="flex justify-between border-t pt-2 text-base font-bold text-slate-900">
                  <dt>Total</dt>
                  <dd>{formatMoney(quote.total)} {quote.currency}</dd>
                </div>
              </dl>
            </div>
          </DetailSection>

          {(quote.notes || quote.terms) && (
            <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
              <DetailSection title="Notes">
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{quote.notes || "-"}</p>
              </DetailSection>
              <DetailSection title="Terms & Conditions">
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{quote.terms || "-"}</p>
              </DetailSection>
            </div>
          )}
        </div>
      )}

      {tab === "comments" && <BusinessPortalComments entityType="quote" entityId={quote.id} />}

      {tab === "activity" && (
        <div>
          <h3 className="mb-4 text-base font-medium text-slate-900">Activity</h3>
          <ActivityList
            entries={[
              { label: "Quote created", at: quote.createdAt },
              { label: `Status: ${status}`, at: (quote as { updatedAt?: string }).updatedAt },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default QuoteDetails;
