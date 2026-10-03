"use client";

import React, { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { usePortalQuery } from "@/lib/portalApi";
import { formatDate, formatMoney, toDateInput } from "@/lib/format";
import { PageTitle, PCard, PTable, Money, PageLoading, ErrorNote, FilterRow, fieldClass, outlineBtn } from "./PortalUI";

interface Statement {
  currency: string;
  opening: number;
  invoiced: number;
  paid: number;
  closing: number;
  lines: { date: string; type: string; reference: string; charge: number; payment: number; balance: number }[];
}

const PortalStatements: React.FC = () => {
  const defaults = useMemo(() => {
    const now = new Date();
    return { from: toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)), to: toDateInput(now) };
  }, []);
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const { data, error, loading } = usePortalQuery<{ statements: Statement[] }>(
    `/statement?from=${from}&to=${to}`,
  );

  return (
    <>
      <PageTitle
        title="Statements"
        subtitle="Your account activity for a period."
        actions={
          <button onClick={() => window.print()} className={outlineBtn}>
            <Printer className="w-4 h-4" />
            Download PDF
          </button>
        }
      />
      <FilterRow>
        <label className="text-[12px] text-slate-500 sm:w-44">
          From
          <input type="date" className={`${fieldClass} mt-1`} value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="text-[12px] text-slate-500 sm:w-44">
          To
          <input type="date" className={`${fieldClass} mt-1`} value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </FilterRow>

      {loading ? (
        <PageLoading />
      ) : error ? (
        <ErrorNote message={error.message} />
      ) : (data?.statements || []).length === 0 ? (
        <PCard>
          <p className="py-8 text-center text-[14px] text-slate-500">No activity in this period.</p>
        </PCard>
      ) : (
        <div className="space-y-4">
          {data?.statements.map((s) => (
            <PCard key={s.currency} title={`Statement of account (${s.currency})`}>
              <p className="text-[12px] text-slate-500 mb-4">
                {formatDate(from)} – {formatDate(to)}
              </p>
              <dl className="max-w-sm ml-auto space-y-2 text-[14px] mb-6">
                <div className="flex justify-between text-slate-600">
                  <dt>Opening balance</dt>
                  <dd className="tabular-nums">{formatMoney(s.opening)}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                  <dt>Invoiced</dt>
                  <dd className="tabular-nums">{formatMoney(s.invoiced)}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                  <dt>Payments</dt>
                  <dd className="tabular-nums">-{formatMoney(s.paid)}</dd>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-[16px] font-bold text-slate-900">
                  <dt>Closing balance</dt>
                  <dd className="tabular-nums">
                    {formatMoney(s.closing)} {s.currency}
                  </dd>
                </div>
              </dl>
              <PTable
                rows={s.lines}
                getId={(l) => `${l.type}-${l.reference}`}
                empty="No transactions in this period."
                columns={[
                  { key: "d", label: "Date", render: (l) => formatDate(l.date) },
                  { key: "t", label: "Type", render: (l) => l.type },
                  { key: "r", label: "Reference", render: (l) => l.reference },
                  { key: "c", label: "Charges", align: "right", render: (l) => (l.charge ? formatMoney(l.charge) : "") },
                  { key: "p", label: "Payments", align: "right", render: (l) => (l.payment ? formatMoney(l.payment) : "") },
                  { key: "b", label: "Balance", align: "right", render: (l) => <Money amount={l.balance} className="font-semibold text-slate-900" /> },
                ]}
              />
            </PCard>
          ))}
        </div>
      )}
    </>
  );
};

export default PortalStatements;
