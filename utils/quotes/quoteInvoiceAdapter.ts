import type { Quote } from "@/entities/Quote";

export interface InvoiceLine {
  itemId: number | null;
  title: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

/**
 * Quote lines in invoice-line shape. Shipping and adjustment become their own
 * lines so that the invoice engine (items - discount%) reproduces the quote
 * total exactly. Used by both Quote -> Invoice conversion and the quote PDF.
 */
export const quoteToInvoiceLines = (quote: Quote): InvoiceLine[] => {
  const lines: InvoiceLine[] = [...(quote.items || [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((i) => ({
      itemId: i.itemId ?? null,
      title: i.name,
      description: i.description || "",
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
