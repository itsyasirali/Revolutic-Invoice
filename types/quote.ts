export type QuoteStatus =
  | "Draft"
  | "Sent"
  | "Viewed"
  | "Accepted"
  | "Declined"
  | "Expired"
  | "Converted";

export const QUOTE_STATUSES: QuoteStatus[] = [
  "Draft",
  "Sent",
  "Viewed",
  "Accepted",
  "Declined",
  "Expired",
  "Converted",
];

export interface QuoteItem {
  id?: number;
  itemId?: number | null;
  name: string;
  description?: string | null;
  quantity: number | string;
  rate: number | string;
  /** Line discount % */
  discount: number | string;
  /** Line tax % */
  tax: number | string;
  amount?: number | string;
  sortOrder?: number;
}

export interface Quote {
  id: number;
  quoteNumber: string;
  quoteDate: string;
  expiryDate?: string | null;
  currency: string;
  referenceNumber?: string | null;
  customerId: number;
  customer?: {
    id: number;
    displayName?: string;
    companyName?: string;
    address?: string;
    contacts?: { firstName?: string; lastName?: string; email?: string; contact?: string }[];
  } | null;
  templateId?: number | null;
  template?: { id: number; name?: string } | null;
  items: QuoteItem[];
  subTotal: number | string;
  discountPercent: number;
  discount: number | string;
  tax: number | string;
  shipping: number | string;
  adjustment: number | string;
  total: number | string;
  notes?: string | null;
  terms?: string | null;
  status: QuoteStatus;
  convertedInvoiceId?: number | null;
  projectId?: number | null;
  convertedInvoice?: { id: number; invoiceNumber: string } | null;
  createdAt?: string;
}

export interface QuoteListProps {
  initialQuotes?: Quote[];
}
