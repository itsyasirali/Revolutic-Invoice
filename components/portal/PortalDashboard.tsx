"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ScrollText,
  Wallet,
  FileText,
  Clock,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { usePortalMe, usePortalQuery } from "@/lib/portalApi";
import { formatDate, formatMoney } from "@/lib/format";
import { setNavState } from "@/lib/clientNavState";
import { PageLoading, ErrorNote, Status } from "./PortalUI";

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
    invoiceDate?: string | null;
    dueDate?: string | null;
    remaining: number;
    total: number;
    currency: string;
    status: string;
  }[];
  activity: { at: string; title: string; href: string }[];
}

const greeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";
  return "Good Night";
};

const MiniBarChart = ({ color }: { color: string }) => (
  <div className="flex items-end gap-1 h-7">
    {["40%", "70%", "50%", "90%", "65%"].map((h, i) => (
      <div key={i} style={{ height: h, backgroundColor: color }} className="w-1 rounded-t-sm" />
    ))}
  </div>
);

const MetricCard: React.FC<{
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  iconBg: string;
  sparkColor: string;
  danger?: boolean;
}> = ({ label, value, hint, icon: Icon, iconBg, sparkColor, danger }) => (
  <div className="group relative overflow-hidden rounded-md p-5 border border-slate-200/70 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
    <div className="relative mb-3 flex items-start justify-between gap-3">
      <div className={`w-12 h-12 shrink-0 rounded-md bg-gradient-to-br ${iconBg} text-white flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="relative space-y-1 text-right min-w-0">
        <span className="text-xs font-semibold text-slate-500 block">{label}</span>
        <h3 className={`text-2xl font-extrabold tracking-tight ${danger ? "text-rose-600" : "text-slate-900"}`}>{value}</h3>
      </div>
    </div>
    <div className="relative flex items-center justify-between mt-4 pt-1">
      <span className="text-slate-400 text-[11px]">{hint}</span>
      <MiniBarChart color={sparkColor} />
    </div>
  </div>
);

const Card: React.FC<{
  title: string;
  icon: LucideIcon;
  action?: { href: string; label: string };
  children: React.ReactNode;
}> = ({ title, icon: Icon, action, children }) => (
  <div className="bg-white rounded-md p-5 border border-slate-200/80 h-full flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-md bg-blue-50 text-primary flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </span>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors"
        >
          <span>{action.label}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
    {children}
  </div>
);

const EmptyState: React.FC<{ icon: LucideIcon; title: string }> = ({ icon: Icon, title }) => (
  <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
      <Icon className="w-6 h-6" />
    </div>
    <p className="text-sm font-semibold text-slate-800">{title}</p>
  </div>
);

const PortalDashboard: React.FC = () => {
  const router = useRouter();
  const { me } = usePortalMe();
  const { data, error, loading } = usePortalQuery<Dashboard>("/dashboard");
  if (loading) return <PageLoading />;
  if (error || !data || !me) return <ErrorNote message={error?.message || "Failed to load dashboard"} />;
  const s = me.settings;

  const outstandingText = data.outstanding.length
    ? data.outstanding.map((o) => `${o.currency} ${Math.round(o.amount).toLocaleString()}`).join(" · ")
    : "0";

  const openInvoice = (inv: Dashboard["recentInvoices"][number]) => {
    setNavState(`portal-invoice:${inv.id}`, {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      total: inv.total,
      remaining: inv.remaining,
      currency: inv.currency,
      status: inv.status,
    });
    router.push(`/portal/invoices/${inv.id}`);
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 space-y-6 pb-12 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
          {greeting()}, {me.user.name?.split(" ")[0] || me.customer.displayName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {s.welcomeMessage || "Here is an overview of your account."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {s.canViewInvoices && (
          <MetricCard
            label="Outstanding"
            value={outstandingText}
            hint={`${data.outstandingCount} open invoice${data.outstandingCount === 1 ? "" : "s"}${
              data.overdueCount ? ` · ${data.overdueCount} overdue` : ""
            }`}
            icon={ScrollText}
            iconBg={data.overdueCount ? "from-rose-500 to-rose-600" : "from-blue-500 to-blue-600"}
            sparkColor={data.overdueCount ? "#EF4444" : "#1AA3FF"}
            danger={!!data.overdueCount}
          />
        )}
        {s.canViewPayments && (
          <MetricCard
            label="Last Payment"
            value={data.lastPayment ? `${data.lastPayment.currency} ${formatMoney(data.lastPayment.amount)}` : "—"}
            hint={data.lastPayment ? formatDate(data.lastPayment.date) : "No payments yet"}
            icon={Wallet}
            iconBg="from-cyan-500 to-cyan-600"
            sparkColor="#06B6D4"
          />
        )}
        {s.canViewQuotes && (
          <MetricCard
            label="Quotes Awaiting Approval"
            value={String(data.quotesAwaiting.length)}
            hint={data.quotesAwaiting.length ? "Review and accept or decline" : "Nothing to review"}
            icon={FileText}
            iconBg="from-amber-500 to-amber-600"
            sparkColor="#F59E0B"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {s.canViewInvoices && (
          <div className="lg:col-span-8 min-h-80">
            <Card title="Recent Invoices" icon={ScrollText} action={{ href: "/portal/invoices", label: "View All" }}>
              {data.recentInvoices.length === 0 ? (
                <EmptyState icon={ScrollText} title="No invoices yet" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 pl-2 font-medium">INVOICE</th>
                        <th className="pb-3 font-medium">DUE DATE</th>
                        <th className="pb-3 font-medium">STATUS</th>
                        <th className="pb-3 font-medium text-right">BALANCE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.recentInvoices.map((i) => (
                        <tr
                          key={i.id}
                          onClick={() => openInvoice(i)}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        >
                          <td className="py-3 pl-2 font-semibold text-slate-800">{i.invoiceNumber}</td>
                          <td className="py-3 text-slate-400">{formatDate(i.dueDate)}</td>
                          <td className="py-3">
                            <Status status={i.status} />
                          </td>
                          <td className="py-3 text-right font-bold text-slate-900">
                            {i.currency} {formatMoney(i.status === "Paid" ? i.total : i.remaining)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        <div className={`${s.canViewInvoices ? "lg:col-span-4" : "lg:col-span-12"} min-h-80`}>
          <Card title="Recent Activity" icon={Clock}>
            {data.activity.length === 0 ? (
              <EmptyState icon={Clock} title="No recent activity" />
            ) : (
              <ul className="space-y-3">
                {data.activity.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                    <div className="min-w-0">
                      <Link href={a.href} className="text-slate-800 hover:text-primary">
                        {a.title}
                      </Link>
                      <p className="text-xs text-slate-400">{formatDate(a.at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {s.canViewQuotes && data.quotesAwaiting.length > 0 && (
        <Card title="Quotes Awaiting Your Approval" icon={FileText} action={{ href: "/portal/quotes", label: "View All" }}>
          <ul className="divide-y divide-slate-50">
            {data.quotesAwaiting.map((q) => (
              <li
                key={q.id}
                onClick={() => {
                  setNavState(`portal-quote:${q.id}`, {
                    id: q.id,
                    quoteNumber: q.quoteNumber,
                    expiryDate: q.expiryDate,
                    total: q.total,
                    currency: q.currency,
                    status: "Sent",
                  });
                  router.push(`/portal/quotes/${q.id}`);
                }}
                className="flex items-center justify-between py-3 text-sm cursor-pointer hover:bg-slate-50/70"
              >
                <div className="pl-2">
                  <p className="font-semibold text-slate-800">{q.quoteNumber}</p>
                  {q.expiryDate && <p className="text-xs text-slate-400">Expires {formatDate(q.expiryDate)}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900">
                    {q.currency} {formatMoney(q.total)}
                  </span>
                  <span className="text-xs font-semibold text-primary">Review</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {s.canViewProjects && s.canViewTimesheets && s.canApproveTimesheets && data.timesheetsAwaiting > 0 && (
        <Card title="Timesheets Awaiting Approval" icon={Clock} action={{ href: "/portal/projects", label: "Review" }}>
          <p className="text-sm text-slate-600">
            {data.timesheetsAwaiting} time {data.timesheetsAwaiting === 1 ? "entry is" : "entries are"} waiting for
            your review before billing.
          </p>
        </Card>
      )}
    </div>
  );
};

export default PortalDashboard;
