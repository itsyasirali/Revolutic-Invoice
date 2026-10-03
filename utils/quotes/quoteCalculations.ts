import { round2 } from "@/lib/numbering";

export interface QuoteItemInput {
  itemId?: number | string | null;
  name?: string;
  description?: string;
  quantity?: number | string;
  rate?: number | string;
  discount?: number | string; // line discount %
  tax?: number | string; // line tax %
}

export interface QuoteTotalsInput {
  items?: QuoteItemInput[];
  discountPercent?: number | string;
  shipping?: number | string;
  adjustment?: number | string;
}

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Server-side quote math (never trust client totals).
 *   line amount = qty x rate - line discount% + line tax%
 *   base        = sum(line amounts) + shipping + adjustment
 *   total       = base - base x discount%
 * Discount applies to the same base the invoice engine uses, so a converted
 * invoice (items + shipping/adjustment lines + discountPercent) matches exactly.
 */
export const calculateQuoteTotals = (input: QuoteTotalsInput) => {
  let taxTotal = 0;
  const items = (input.items || []).map((raw, index) => {
    const quantity = num(raw.quantity);
    const rate = num(raw.rate);
    const discount = Math.min(100, Math.max(0, num(raw.discount)));
    const tax = Math.max(0, num(raw.tax));
    const gross = quantity * rate;
    const taxable = gross - (gross * discount) / 100;
    const taxAmount = (taxable * tax) / 100;
    taxTotal += taxAmount;
    return {
      itemId: raw.itemId ? Number(raw.itemId) : null,
      name: String(raw.name ?? "").trim(),
      description: raw.description ? String(raw.description).trim() : "",
      quantity: round2(quantity),
      rate: round2(rate),
      discount,
      tax,
      amount: round2(taxable + taxAmount),
      sortOrder: index,
    };
  });

  const subTotal = round2(items.reduce((s, i) => s + i.amount, 0));
  const shipping = round2(num(input.shipping));
  const adjustment = round2(num(input.adjustment));
  const discountPercent = Math.min(100, Math.max(0, num(input.discountPercent)));
  const base = subTotal + shipping + adjustment;
  const discount = round2((base * discountPercent) / 100);
  const total = round2(Math.max(0, base - discount));

  return {
    items,
    subTotal,
    tax: round2(taxTotal),
    shipping,
    adjustment,
    discountPercent,
    discount,
    total,
  };
};
