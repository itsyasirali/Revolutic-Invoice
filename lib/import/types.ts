// Draft records: the CSV rows mapped to plain, editable objects. They are shown
// (and edited) in the import preview, then sent back and saved as-is.

export type ImportKind = "contacts" | "items" | "invoices" | "payments";
export type EntityKey = "customers" | "items" | "invoices" | "payments";

export const KIND_ENTITY: Record<ImportKind, EntityKey> = {
  contacts: "customers",
  items: "items",
  invoices: "invoices",
  payments: "payments",
};

export interface CustomerDraft {
  displayName: string;
  companyName: string;
  customerType: string;
  currency: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  remarks: string;
  createdTime: string;
}

export interface ItemDraft {
  name: string;
  type: string;
  unit: string;
  sellingPrice: number;
  description: string;
  status: string;
}

export interface InvoiceLineDraft {
  title: string;
  description: string;
  itemName: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceDraft {
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  terms: string;
  status: string;
  currency: string;
  subTotal: number;
  total: number;
  balance: number;
  discountPercent: number;
  notes: string;
  recipientEmail: string;
  lines: InvoiceLineDraft[];
}

export interface PaymentAppliedDraft {
  invoiceNumber: string;
  amount: number;
}

export interface PaymentDraft {
  paymentNumber: string;
  customerName: string;
  paymentDate: string;
  paymentMode: string;
  referenceNo: string;
  currency: string;
  amount: number;
  bankCharges: number;
  status: string;
  notes: string;
  createdTime: string;
  applied: PaymentAppliedDraft[];
}

export interface ImportDrafts {
  customers?: CustomerDraft[];
  items?: ItemDraft[];
  invoices?: InvoiceDraft[];
  payments?: PaymentDraft[];
}

export type RowStatus = "new" | "exists" | "error";

export interface ImportIssue {
  entity: EntityKey;
  index: number;
  message: string;
}

export interface ImportResult {
  statuses: Partial<Record<EntityKey, RowStatus[]>>;
  errors: ImportIssue[];
  warnings: string[];
}
