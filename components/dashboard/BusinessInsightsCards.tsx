import React from "react";
import { Receipt, Timer, FileText } from "lucide-react";
import type { BusinessInsights } from "@/types/dashboard";

interface Props {
  insights: BusinessInsights;
  /** Org currency symbol, same one the KPI cards use. */
  currency: string;
}

const money = (symbol: string, n: number) =>
  `${symbol} ${Math.round(n).toLocaleString()}`;

const Row = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-bold text-slate-900">{value}</span>
  </div>
);

const Panel = ({
  icon: Icon,
  title,
  tint,
  children,
}: {
  icon: React.ElementType;
  title: string;
  tint: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-md p-5 border border-slate-200/80">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${tint}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
    </div>
    {children}
  </div>
);

/** Expenses / Time Tracking / Quotes summaries; all values come from real records. */
const BusinessInsightsCards = ({ insights, currency }: Props) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    <Panel icon={Receipt} title="Expenses" tint="bg-rose-50 text-rose-600">
      <Row label="Expenses This Month" value={money(currency, insights.expenses.thisMonth)} />
      <Row label="Billable Expenses" value={money(currency, insights.expenses.billable)} />
      <Row label="Unbilled Expenses" value={money(currency, insights.expenses.unbilled)} />
    </Panel>
    <Panel icon={Timer} title="Time Tracking" tint="bg-blue-50 text-primary">
      <Row label="Tracked Hours (this month)" value={`${insights.time.trackedHours} h`} />
      <Row label="Billable Hours (this month)" value={`${insights.time.billableHours} h`} />
      <Row
        label="Unbilled Time"
        value={`${insights.time.unbilledHours} h · ${money(currency, insights.time.unbilledAmount)}`}
      />
    </Panel>
    <Panel icon={FileText} title="Quotes" tint="bg-purple-50 text-purple-600">
      <Row label="Quotes" value={insights.quotes.total} />
      <Row label="Draft Quotes" value={insights.quotes.draft} />
      <Row label="Pending Quotes" value={insights.quotes.pending} />
      <Row label="Accepted Quotes" value={insights.quotes.accepted} />
      <Row label="Quote Value (open)" value={money(currency, insights.quotes.value)} />
    </Panel>
  </div>
);

export default BusinessInsightsCards;
