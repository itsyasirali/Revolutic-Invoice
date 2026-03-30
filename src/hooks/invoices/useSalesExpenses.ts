import { useMemo } from "react";
import useInvoicesList from "../invoices/useInvoicesData";
import { usePKRCurrency } from "../common/useCurrencyExchange";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const parseAmount = (v: unknown) => {
  const n = Number(v);
  if (Number.isFinite(n)) return n;
  if (typeof v === "string") {
    const x = Number(v.replace(/[^\d.-]/g, ""));
    return Number.isFinite(x) ? x : 0;
  }
  return 0;
};

export const useSalesExpenses = () => {
  const { items, loading, refetch } = useInvoicesList();
  const { convertToPKR, loading: ratesLoading } = usePKRCurrency();

  const data = useMemo(() => {
    const base = MONTH_LABELS.map((m) => ({
      month: m,
      sales: 0,
      expenses: 0,
      receipts: 0,
    }));

    items.forEach((inv) => {
      const raw = inv.raw ?? {};
      const d = new Date(raw.invoiceDate ?? raw.date ?? (inv as any).invoiceDate);
      if (isNaN(d.getTime())) return;

      const i = d.getMonth();
      const currency = raw.currency || (inv as any).currency || "PKR";

      base[i].sales += convertToPKR(
        parseAmount(raw.total ?? raw.amount),
        currency
      );

      base[i].receipts += convertToPKR(
        parseAmount(raw.received),
        currency
      );

      base[i].expenses += convertToPKR(
        parseAmount(raw.expenses),
        currency
      );
    });

    return base;
  }, [items, convertToPKR]);

  const totals = useMemo(
    () =>
      data.reduce(
        (a, b) => ({
          sales: a.sales + b.sales,
          receipts: a.receipts + b.receipts,
          expenses: a.expenses + b.expenses,
        }),
        { sales: 0, receipts: 0, expenses: 0 }
      ),
    [data]
  );

  return {
    data,
    totals,
    loading: loading || ratesLoading,
    refetch,
  };
};
