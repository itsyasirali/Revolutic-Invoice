import { round2 } from "@/lib/numbering";

export const calculateExpenseTotals = (amountRaw: unknown, taxPercentRaw: unknown) => {
  const amount = round2(Math.max(0, Number(amountRaw) || 0));
  const taxPercent = Math.max(0, Number(taxPercentRaw) || 0);
  const tax = round2((amount * taxPercent) / 100);
  return { amount, taxPercent, tax, total: round2(amount + tax) };
};

export const deriveExpenseStatus = (billable: boolean, invoiced: boolean) =>
  invoiced ? "Invoiced" : billable ? "Unbilled" : "Non-Billable";
