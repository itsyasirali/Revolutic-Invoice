"use client";

import React from "react";
import { Download, FileText } from "lucide-react";
import usePortalStatements from "@/hooks/portal/usePortalStatements";
import { formatMoney } from "@/lib/format";
import { PageHeader, Table, CurrencyDisplay } from "@/components/ui";
import type { TableColumn } from "@/types/common";
import {
  StatementRangePicker,
} from "@/components/customer/CustomerStatement";
import { PageLoading, ErrorNote, TABLE_INSET } from "./PortalUI";

interface StatementLine {
  date: string;
  type: string;
  reference: string;
  charge: number;
  payment: number;
  balance: number;
}

export interface Statement {
  currency: string;
  opening: number;
  invoiced: number;
  paid: number;
  closing: number;
  lines: StatementLine[];
}

export interface Row {
  id: string;
  date: string;
  type: string;
  reference: string;
  charge: number;
  payment: number;
  balance: number;
}

const PortalStatements: React.FC = () => {
  const {
    range, setRange, customFrom, setCustomFrom, customTo, setCustomTo, error, loading, statements,
    periodLabel, rangeName, rowsFor, downloading, handleDownload,
  } = usePortalStatements();

  const columns = (currency: string): TableColumn<Row>[] => [
    { key: "date", label: "DATE", render: (r) => <span className="text-gray-600">{r.date}</span> },
    { key: "type", label: "TYPE", render: (r) => <span className="text-gray-600">{r.type}</span> },
    { key: "reference", label: "REFERENCE", render: (r) => <span className="font-bold text-gray-900">{r.reference}</span> },
    {
      key: "charge",
      label: "INVOICED",
      align: "right" as const,
      render: (r) => (r.charge ? <CurrencyDisplay amount={r.charge} currency={currency} className="text-gray-900" /> : null),
    },
    {
      key: "payment",
      label: "PAID",
      align: "right" as const,
      render: (r) => (r.payment ? <CurrencyDisplay amount={r.payment} currency={currency} className="text-gray-900" /> : null),
    },
    {
      key: "balance",
      label: "BALANCE",
      align: "right" as const,
      render: (r) => <CurrencyDisplay amount={r.balance} currency={currency} className="font-bold text-gray-900" />,
    },
  ];

  return (
    <div className="pb-8 space-y-4">
      <PageHeader
        title="Statement"
        subtitle={<span>{rangeName === "Custom" || range === "all" ? periodLabel : `${rangeName}: ${periodLabel}`}</span>}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatementRangePicker
              range={range}
              from={customFrom}
              to={customTo}
              onRange={setRange}
              onFrom={setCustomFrom}
              onTo={setCustomTo}
            />
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || statements.length === 0}
              className="flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm text-white hover:opacity-90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Preparing..." : "Download Statement"}
            </button>
          </div>
        }
      />

      {loading ? (
        <PageLoading />
      ) : error ? (
        <div className="px-2 sm:px-4 md:px-6">
          <ErrorNote message={error.message} />
        </div>
      ) : statements.length === 0 ? (
        <Table
          columns={columns("")}
          data={[]}
          showCheckbox={false}
          emptyMessage="No statement entries found"
          emptyIcon={FileText}
          variant="spacious"
          className={TABLE_INSET}
        />
      ) : (
        statements.map((s) => (
          <div key={s.currency} className="space-y-4">
            <div className="px-2 sm:px-4 md:px-6 text-sm text-slate-700">
              Balance Due ({s.currency}):{" "}
              <span className="font-bold text-slate-900">
                {s.currency} {formatMoney(s.closing)}
              </span>
            </div>
            <Table<Row>
              columns={columns(s.currency)}
              data={rowsFor(s)}
              getRowId={(r) => r.id}
              showCheckbox={false}
              emptyMessage="No statement entries found"
              emptyIcon={FileText}
              variant="spacious"
              className={TABLE_INSET}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default PortalStatements;
