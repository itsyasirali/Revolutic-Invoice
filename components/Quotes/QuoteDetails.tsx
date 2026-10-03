"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Send,
  Eye,
  Download,
  Copy,
  Edit,
  Trash2,
  FileCheck2,
  CheckCircle2,
  XCircle,
  ScrollText,
  Mail,
  MapPin,
  Calendar,
  Clock,
  FileQuestion,
  FolderKanban,
} from "lucide-react";
import { OrgLink as Link } from "@/components/organization/OrgLink";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import {
  Button,
  StatusBadge,
  ConfirmDialog,
  LoadingSpinner,
  EmptyState,
} from "@/components/ui";
import { DetailBreadcrumb, ActivityList } from "@/components/ui/DetailParts";
import useQuote, { runQuoteAction } from "@/hooks/quotes/useQuote";
import { createProjectFromQuote } from "@/hooks/projects/useProject";
import useBatchDelete from "@/hooks/common/useBatchDelete";
import { invalidateQuotes } from "@/lib/swr";
import { statusVariant } from "@/lib/statusVariants";
import { customerLabel, formatDate, formatMoney } from "@/lib/format";
import BusinessPortalComments from "@/components/portal/BusinessPortalComments";

const QuoteDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { quote, loading, notFound, refetch } = useQuote(params?.id);
  const [acting, setActing] = useState(false);

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
  const canEdit = !["Accepted", "Converted"].includes(status);
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
    else if (action === "clone" && data.quote) router.push(`/quotes/${data.quote.id}`);
    else await refetch();
  };

  const makeProject = async () => {
    setActing(true);
    const project = await createProjectFromQuote(quote.id);
    setActing(false);
    if (project) router.push(`/projects/${project.id}`);
  };

  const actionButton = "font-medium rounded-lg shadow-2xs";

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

      <DetailBreadcrumb section="Quotes" href="/quotes" current={quote.quoteNumber} />

      {/* Quote Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-xs">
            <ScrollText className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {quote.quoteNumber}
              </h1>
              <StatusBadge status={status} variant={statusVariant(status)} />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {customerLabel(quote.customer)} · {formatMoney(quote.total)} {quote.currency}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:w-52 shrink-0">
          {canSend && (
            <Button
              onClick={() => router.push(`/quotes/${quote.id}/email`)}
              variant="primary"
              size="md"
              fullWidth
              icon={<Send className="w-4 h-4" />}
              className={actionButton}
            >
              Send Quote
            </Button>
          )}
          {canConvert && (
            <Button
              onClick={() => act("convert")}
              loading={acting}
              variant="success"
              size="md"
              fullWidth
              icon={<FileCheck2 className="w-4 h-4" />}
              className={actionButton}
            >
              Convert to Invoice
            </Button>
          )}
          {canCreateProject && (
            <Button onClick={makeProject} loading={acting} variant="outline" size="md" fullWidth icon={<FolderKanban className="w-4 h-4" />} className={actionButton}>
              Create Project
            </Button>
          )}
          {quote.projectId ? (
            <Button onClick={() => router.push(`/projects/${quote.projectId}`)} variant="outline" size="md" fullWidth icon={<FolderKanban className="w-4 h-4" />} className={actionButton}>
              View Project
            </Button>
          ) : null}
          {status === "Sent" && (
            <Button onClick={() => act("viewed")} disabled={acting} variant="outline" size="md" fullWidth icon={<Eye className="w-4 h-4" />} className={actionButton}>
              Mark Viewed
            </Button>
          )}
          {canRespond && (
            <>
              <Button onClick={() => act("accept")} disabled={acting} variant="success" size="md" fullWidth icon={<CheckCircle2 className="w-4 h-4" />} className={actionButton}>
                Mark Accepted
              </Button>
              <Button onClick={() => act("decline")} disabled={acting} variant="warning" size="md" fullWidth icon={<XCircle className="w-4 h-4" />} className={actionButton}>
                Mark Declined
              </Button>
            </>
          )}
          <Button onClick={() => router.push(`/quotes/preview/${quote.id}`)} variant="outline" size="md" fullWidth icon={<Eye className="w-4 h-4" />} className={actionButton}>
            Preview
          </Button>
          <Button onClick={() => router.push(`/quotes/preview/${quote.id}?download=1`)} variant="outline" size="md" fullWidth icon={<Download className="w-4 h-4" />} className={actionButton}>
            Download PDF
          </Button>
          <Button onClick={() => act("clone")} disabled={acting} variant="outline" size="md" fullWidth icon={<Copy className="w-4 h-4" />} className={actionButton}>
            Clone
          </Button>
          {canEdit && (
            <Button onClick={() => router.push(`/quotes/edit/${quote.id}`)} variant="outline" size="md" fullWidth icon={<Edit className="w-4 h-4" />} className={actionButton}>
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              onClick={() => del.requestDelete([quote.id], () => router.push("/quotes"))}
              variant="danger"
              size="md"
              fullWidth
              icon={<Trash2 className="w-4 h-4" />}
              className={actionButton}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Customer + Quote information */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Customer Information</h2>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <p className="font-semibold text-slate-900">
                {quote.customer ? (
                  <Link href={`/customers/${quote.customer.id}`} className="text-primary hover:underline">
                    {customerLabel(quote.customer)}
                  </Link>
                ) : (
                  "Unnamed Customer"
                )}
              </p>
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{contact?.email || "No email provided"}</span>
              </div>
              <div className="flex items-start gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{quote.customer?.address || "No address provided"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Quote Information</h2>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Quote date: {formatDate(quote.quoteDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Expiry date: {formatDate(quote.expiryDate) || "None"}</span>
              </div>
              {quote.referenceNumber && (
                <div className="flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Reference: {quote.referenceNumber}</span>
                </div>
              )}
              {quote.convertedInvoice && (
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Converted to invoice{" "}
                    <Link href={`/invoices/${quote.convertedInvoice.id}`} className="text-primary hover:underline font-semibold">
                      {quote.convertedInvoice.invoiceNumber}
                    </Link>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <h2 className="text-base font-bold text-slate-900 tracking-tight p-6 pb-3">Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8FAFC] border-y border-slate-200/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
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
                <tr key={item.id ?? item.name} className="border-b border-slate-100">
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

        <div className="p-6 flex justify-end">
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
      </div>

      {(quote.notes || quote.terms) && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight mb-2">Notes</h2>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{quote.notes || "-"}</p>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight mb-2">Terms & Conditions</h2>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{quote.terms || "-"}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-4">Activity</h2>
        <ActivityList
          entries={[
            { label: "Quote created", at: quote.createdAt },
            { label: `Status: ${status}`, at: (quote as { updatedAt?: string }).updatedAt },
          ]}
        />
      </div>
      <BusinessPortalComments entityType="quote" entityId={quote.id} />
    </div>
  );
};

export default QuoteDetails;
