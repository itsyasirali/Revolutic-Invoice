// Once an invoice, quote or payment has been sent to the customer it must not change
// any more (the customer holds a copy). These rules are used by the screens (disabled
// edit buttons, redirects) and mirrored by the server, which is what really enforces them.

/** Invoices and quotes are only editable as drafts; anything past Draft has been sent or settled. */
export const invoiceEditable = (status?: string | null) => (status || "Draft") === "Draft";
export const quoteEditable = (status?: string | null) => (status || "Draft") === "Draft";

/** A payment is locked once its receipt has been sent. */
export const paymentEditable = (status?: string | null) => status !== "Sent";

export const LOCKED_MESSAGE = {
  invoice: "A sent invoice can no longer be edited.",
  quote: "A sent quote can no longer be edited.",
  payment: "A sent payment can no longer be edited.",
} as const;
