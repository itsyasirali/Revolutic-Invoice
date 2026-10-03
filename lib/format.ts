export const formatMoney = (value: unknown) => {
  const n = Number(value);
  return (Number.isFinite(n) ? n : 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatDate = (value: unknown) => {
  if (!value) return "";
  const d = new Date(String(value));
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

/** YYYY-MM-DD in local time, for <input type="date">. */
export const toDateInput = (value?: unknown) => {
  const d = value ? new Date(String(value)) : new Date();
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const customerLabel = (
  c?: { displayName?: string; companyName?: string } | null,
) => c?.displayName || c?.companyName || "";

/** "1,200.00 PKR · 50.00 USD": totals never mix currencies. */
export const sumByCurrency = <T,>(
  rows: T[],
  amountOf: (row: T) => unknown,
  currencyOf: (row: T) => string,
) => {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const cur = currencyOf(row) || "PKR";
    totals.set(cur, (totals.get(cur) || 0) + (Number(amountOf(row)) || 0));
  }
  if (totals.size === 0) return "0.00";
  return Array.from(totals.entries())
    .map(([cur, total]) => `${formatMoney(total)} ${cur}`)
    .join(" · ");
};
