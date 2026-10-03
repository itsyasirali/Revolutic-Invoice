"use client";

import React from "react";
import Link from "next/link";
import { usePortalMe, usePortalQuery } from "@/lib/portalApi";
import { formatDate, formatMoney } from "@/lib/format";
import { PageTitle, PCard, Stat, Money, Status, PageLoading, ErrorNote, Empty } from "./PortalUI";

interface Dashboard {
  outstanding: { currency: string; amount: number }[];
  outstandingCount: number;
  overdueCount: number;
  lastPayment: { id: number; amount: number; currency: string; date: string } | null;
  quotesAwaiting: { id: number; quoteNumber: string; total: number; currency: string; expiryDate?: string | null }[];
  timesheetsAwaiting: number;
  recentInvoices: {
    id: number;
    invoiceNumber: string;
    dueDate?: string | null;
    remaining: number;
    total: number;
    currency: string;
    status: string;
  }[];
  activity: { at: string; title: string; href: string }[];
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const PortalDashboard: React.FC = () => {
  const { me } = usePortalMe();
  const { data, error, loading } = usePortalQuery<Dashboard>("/dashboard");
  if (loading) return <PageLoading />;
  if (error || !data || !me) return <ErrorNote message={error?.message || "Failed to load dashboard"} />;
  const s = me.settings;

  const outstandingText = data.outstanding.length
    ? data.outstanding.map((o) => `${formatMoney(o.amount)} ${o.currency}`).join(" · ")
    : "0.00";

  return (
    <>
      <PageTitle
        title={`${greeting()}, ${me.user.name?.split(" ")[0] || me.customer.displayName}`}
        subtitle={s.welcomeMessage || "Here is an overview of your account."}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {s.canViewInvoices && (
          <Stat
            label="Outstanding"
            value={<span className="text-[22px]">{outstandingText}</span>}
            tone={data.overdueCount ? "danger" : "default"}
            hint={`${data.outstandingCount} open invoice${data.outstandingCount === 1 ? "" : "s"}${
              data.overdueCount ? ` · ${data.overdueCount} overdue` : ""
            }`}
          />
        )}
        {s.canViewPayments && (
          <Stat
            label="Last payment"
            value={
              data.lastPayment ? (
                <span className="text-[22px]">
                  {formatMoney(data.lastPayment.amount)} {data.lastPayment.currency}
                </span>
              ) : (
                "—"
              )
            }
            hint={data.lastPayment ? formatDate(data.lastPayment.date) : "No payments yet"}
          />
        )}
        {s.canViewQuotes && (
          <Stat
            label="Quotes awaiting approval"
            value={data.quotesAwaiting.length}
            hint={data.quotesAwaiting.length ? "Review and accept or decline" : "Nothing to review"}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {s.canViewQuotes && data.quotesAwaiting.length > 0 && (
          <PCard title="Quotes awaiting your approval">
            <ul className="divide-y divide-slate-100">
              {data.quotesAwaiting.map((q) => (
                <li key={q.id} className="flex items-center justify-between py-3 text-[14px]">
                  <div>
                    <p className="font-semibold text-slate-900">{q.quoteNumber}</p>
                    {q.expiryDate && (
                      <p className="text-[12px] text-slate-500">Expires {formatDate(q.expiryDate)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <Money amount={q.total} currency={q.currency} className="font-semibold" />
                    <Link href={`/portal/quotes/${q.id}`} className="text-[13px] font-semibold text-primary hover:underline">
                      Review
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </PCard>
        )}

        {s.canViewProjects && s.canViewTimesheets && s.canApproveTimesheets && data.timesheetsAwaiting > 0 && (
          <PCard title="Timesheets awaiting approval">
            <p className="text-[14px] text-slate-600">
              {data.timesheetsAwaiting} time {data.timesheetsAwaiting === 1 ? "entry is" : "entries are"} waiting for
              your review before billing.
            </p>
            <Link
              href="/portal/projects"
              className="inline-block mt-3 text-[13px] font-semibold text-primary hover:underline"
            >
              Review in projects →
            </Link>
          </PCard>
        )}

        {s.canViewInvoices && (
          <PCard
            title="Recent invoices"
            actions={
              <Link href="/portal/invoices" className="text-[13px] font-semibold text-primary hover:underline">
                View all
              </Link>
            }
          >
            {data.recentInvoices.length === 0 ? (
              <Empty message="No invoices yet." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.recentInvoices.map((i) => (
                  <li key={i.id} className="flex items-center justify-between py-3 text-[14px]">
                    <Link href={`/portal/invoices/${i.id}`} className="font-semibold text-slate-900 hover:text-primary">
                      {i.invoiceNumber}
                    </Link>
                    <div className="flex items-center gap-3">
                      <Money amount={i.status === "Paid" ? i.total : i.remaining} currency={i.currency} />
                      <Status status={i.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </PCard>
        )}

        <PCard title="Recent activity">
          {data.activity.length === 0 ? (
            <Empty message="No recent activity." />
          ) : (
            <ul className="space-y-3">
              {data.activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px]">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                  <div>
                    <Link href={a.href} className="text-slate-800 hover:text-primary">
                      {a.title}
                    </Link>
                    <p className="text-[12px] text-slate-500">{formatDate(a.at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PCard>
      </div>
    </>
  );
};

export default PortalDashboard;
