import type { Quote } from "@/entities/Quote";

export interface InvoiceLine {
  itemId: number | null;
  title: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

/** Shows an item-level discount in the line description (the PDF has no discount column). */
const withLineDiscount = (description: string, discount: number) =>
  discount > 0
    ? [description, `Discount: ${Number(discount.toFixed(2))}%`].filter(Boolean).join(" - ")
    : description;

/**
 * Quote lines in invoice-line shape. Shipping and adjustment become their own
 * lines. The invoice engine discounts every line, so `foldDiscount` (used by
 * Quote -> Invoice conversion) adds the quote discount as a negative line to
 * keep it off shipping/adjustment and reproduce the quote total exactly.
 */
export const quoteToInvoiceLines = (
  quote: Quote,
  { foldDiscount = false }: { foldDiscount?: boolean } = {},
): InvoiceLine[] => {
  const lines: InvoiceLine[] = [...(quote.items || [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((i) => ({
      itemId: i.itemId ?? null,
      title: i.name,
      description: withLineDiscount(i.description || "", Number(i.discount)),
      quantity: Number(i.quantity),
      rate: Number(i.rate),
      amount: Number(i.amount),
    }));
  const shipping = Number(quote.shipping) || 0;
  const adjustment = Number(quote.adjustment) || 0;
  if (shipping !== 0) {
    lines.push({
      itemId: null,
      title: "Shipping",
      description: "",
      quantity: 1,
      rate: shipping,
      amount: shipping,
    });
  }
  if (adjustment !== 0) {
    lines.push({
      itemId: null,
      title: "Adjustment",
      description: "",
      quantity: 1,
      rate: adjustment,
      amount: adjustment,
    });
  }
  const discount = Number(quote.discount) || 0;
  if (foldDiscount && discount > 0) {
    const pct = Number(quote.discountPercent) || 0;
    lines.push({
      itemId: null,
      title: `Discount (${Number(pct.toFixed(2))}%)`,
      description: "",
      quantity: 1,
      rate: -discount,
      amount: -discount,
    });
  }
  return lines;
};

export const quoteNotesWithTerms = (quote: Pick<Quote, "notes" | "terms">) =>
  [quote.notes, quote.terms ? `Terms & Conditions:\n${quote.terms}` : ""]
    .filter(Boolean)
    .join("\n\n");

/**
 * Invoice-shaped view of a quote so the existing template-driven invoice PDF
 * renderer can be reused. Labels are switched to quote wording.
 */
export const quoteToInvoiceDocument = (quote: Quote) => {
  const lines = quoteToInvoiceLines(quote);
  const subTotal = lines.reduce((s, l) => s + l.amount, 0);
  const template = quote.template
    ? {
        ...quote.template,
        invoiceLabel: "QUOTE",
        invoiceDateLabel: "Quote Date",
        dueDateLabel: "Expiry Date",
        balanceDueLabel: "Total",
      }
    : quote.template;
  return {
    ...quote,
    id: quote.id,
    invoiceNumber: quote.quoteNumber,
    invoiceDate: quote.quoteDate,
    dueDate: quote.expiryDate,
    items: lines,
    subTotal,
    discountPercent: quote.discountPercent,
    total: Number(quote.total),
    received: 0,
    remaining: Number(quote.total),
    previousRemaining: 0,
    notes: quoteNotesWithTerms(quote),
    template,
    writeOffs: [],
  };
};
