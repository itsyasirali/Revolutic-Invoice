import { useMemo } from "react";
import useInvoicesList from "./useInvoicesData";
import { usePKRCurrency } from "../common/useCurrencyExchange";

export type BucketKey = "current" | "1-15" | "16-30" | "31-45";

const emptyBuckets: Record<BucketKey, number> = {
  current: 0,
  "1-15": 0,
  "16-30": 0,
  "31-45": 0,
};

export const useReceivables = () => {
  const { rawInvoices, loading: invoiceLoading } = useInvoicesList({});
  const { convertToPKR, loading: ratesLoading } = usePKRCurrency();

  const data = useMemo(() => {
    if (!rawInvoices) {
      return {
        buckets: emptyBuckets,
        totalReceivables: 0,
        paidTotal: 0,
      };
    }

    const buckets = { ...emptyBuckets };
    let paidTotal = 0;

    rawInvoices.forEach((inv) => {
      const status = String(inv?.status ?? "").toLowerCase();
      const currency = inv?.currency || inv?.customerCurrency || "PKR";

      const total = Number(inv?.total ?? inv?.amount ?? 0);
      const paid = Number(inv?.paidAmount ?? inv?.received ?? 0);
      const remaining = Math.max(0, total - paid);

      const totalPKR = convertToPKR(total, currency);
      const paidPKR = convertToPKR(paid, currency);
      const remainingPKR = convertToPKR(remaining, currency);

      if (status === "sent" || status === "partially paid") {
        buckets.current += remainingPKR;
      }

      if (status === "overdue") {
        const dueDate = inv?.dueDate ? new Date(inv.dueDate) : null;
        const overdueDays =
          dueDate &&
          Math.floor(
            (Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
          );

        if (overdueDays !== null) {
          if (overdueDays <= 30) {
            buckets["16-30"] += remainingPKR;
          } else {
            buckets["31-45"] += remainingPKR;
          }
        }
      }

      if (status === "paid" || status === "partially paid") {
        const receivedAmount =
          status === "paid" ? totalPKR : paidPKR;

        paidTotal += receivedAmount;

        const paymentDate = inv?.paidAt || inv?.receivedAt || inv?.updatedAt;
        const paymentDays =
          paymentDate &&
          Math.floor(
            (Date.now() - new Date(paymentDate).getTime()) /
              (1000 * 60 * 60 * 24)
          );

        if (paymentDays !== null && paymentDays <= 15) {
          buckets["1-15"] += receivedAmount;
        }
      }
    });

    return {
      buckets,
      totalReceivables:
        buckets.current + buckets["16-30"] + buckets["31-45"],
      paidTotal,
    };
  }, [rawInvoices, convertToPKR]);

  return {
    ...data,
    isLoading: invoiceLoading || ratesLoading,
  };
};
