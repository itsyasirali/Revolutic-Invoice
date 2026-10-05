import { parseCsvRecords as parseCsv, type CsvRow } from "@/lib/csv";
import type {
  CustomerDraft,
  ImportDrafts,
  InvoiceDraft,
  ItemDraft,
  PaymentDraft,
  ProjectDraft,
  QuoteDraft,
} from "./types";

export interface ImportFiles {
  contacts?: string;
  items?: string;
  projects?: string;
  quotes?: string;
  invoices?: string;
  payments?: string;
}

const str = (row: CsvRow, key: string) => (row[key] ?? "").trim();

const round2 = (n: number) => Number(n.toFixed(2));

const num = (value: string | undefined): number => {
  const cleaned = String(value ?? "").replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const INVOICE_STATUS: Record<string, string> = {
  closed: "Paid",
  paid: "Paid",
  draft: "Draft",
  sent: "Sent",
  overdue: "Overdue",
  "partially paid": "Partially Paid",
  void: "Cancelled",
};

const QUOTE_STATUS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  invoiced: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

const PROJECT_STATUS: Record<string, string> = {
  active: "Active",
  inactive: "On Hold",
  "on hold": "On Hold",
  completed: "Completed",
};

const groupBy = (rows: CsvRow[], keyOf: (row: CsvRow) => string) => {
  const groups = new Map<string, CsvRow[]>();
  for (const row of rows) {
    const key = keyOf(row);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return [...groups.values()];
};

const mapCustomer = (row: CsvRow): CustomerDraft => ({
  displayName: str(row, "Display Name") || str(row, "Company Name"),
  companyName: str(row, "Company Name"),
  customerType: str(row, "Customer Sub Type").toLowerCase() === "individual" ? "Individual" : "Business",
  currency: str(row, "Currency Code") || "USD",
  status: str(row, "Status").toLowerCase() === "inactive" ? "inActive" : "Active",
  firstName: str(row, "First Name"),
  lastName: str(row, "Last Name"),
  email: str(row, "EmailID"),
  phone: str(row, "MobilePhone") || str(row, "Phone"),
  address: [
    "Billing Address",
    "Billing Street2",
    "Billing City",
    "Billing State",
    "Billing Country",
    "Billing Code",
  ]
    .map((k) => str(row, k))
    .filter(Boolean)
    .join(", "),
  remarks: str(row, "Notes"),
  createdTime: str(row, "Created Time"),
});

const mapItem = (row: CsvRow): ItemDraft => ({
  name: str(row, "Item Name"),
  type: str(row, "Product Type").toLowerCase() === "service" ? "Service" : "Goods",
  unit: str(row, "Usage unit"),
  sellingPrice: num(row["Rate"]),
  description: str(row, "Description"),
  status: str(row, "Status").toLowerCase() === "inactive" ? "inActive" : "Active",
});

const mapInvoice = (lines: CsvRow[]): InvoiceDraft => {
  const head = lines[0];
  const rawStatus = str(head, "Invoice Status");
  return {
    invoiceNumber: str(head, "Invoice Number"),
    customerName: str(head, "Customer Name"),
    invoiceDate: str(head, "Invoice Date"),
    dueDate: str(head, "Due Date"),
    terms: str(head, "Payment Terms Label"),
    status: INVOICE_STATUS[rawStatus.toLowerCase()] ?? (rawStatus || "Draft"),
    currency: str(head, "Currency Code") || "PKR",
    subTotal: num(head["SubTotal"]),
    total: num(head["Total"]),
    balance: num(head["Balance"]),
    discountPercent: num(head["Entity Discount Percent"]),
    notes: str(head, "Notes"),
    recipientEmail: str(head, "Primary Contact EmailID"),
    lines: lines.map((l) => {
      const itemName = str(l, "Item Name");
      const itemDesc = str(l, "Item Desc");
      return {
        // Zoho allows a line with only a description; the app needs a title.
        title: itemName || itemDesc,
        description: itemName ? itemDesc : "",
        itemName,
        quantity: num(l["Quantity"]),
        rate: num(l["Item Price"]),
        amount: num(l["Item Total"]),
      };
    }),
  };
};

const mapProject = (row: CsvRow): ProjectDraft => {
  const billing = str(row, "Billing Type").toLowerCase();
  const fixed = billing.includes("fixed");
  const status = str(row, "Project Status");
  return {
    name: str(row, "Project Name"),
    projectNumber: str(row, "Project Code"),
    customerName: str(row, "Customer Name"),
    description: str(row, "Description"),
    status: PROJECT_STATUS[status.toLowerCase()] ?? (status || "Active"),
    billingMethod: fixed ? "Fixed" : "Hourly",
    hourlyRate: 0,
    fixedAmount: fixed ? num(row["Project Cost"]) : 0,
    budgetHours: num(row["Project Budget Hours"]),
    budgetAmount: num(row["Budget Amount"]),
    currency: str(row, "Currency Code") || "PKR",
  };
};

const mapQuote = (lines: CsvRow[]): QuoteDraft => {
  const head = lines[0];
  const status = str(head, "Quote Status");
  return {
    quoteNumber: str(head, "Quote Number"),
    customerName: str(head, "Customer Name"),
    projectName: str(head, "Project Name"),
    quoteDate: str(head, "Quote Date"),
    expiryDate: str(head, "Expiry Date"),
    status: QUOTE_STATUS[status.toLowerCase()] ?? (status || "Draft"),
    currency: str(head, "Currency Code") || "PKR",
    referenceNumber: str(head, "PurchaseOrder"),
    subTotal: num(head["SubTotal"]),
    discountPercent: num(head["Entity Discount Percent"]),
    discount: num(head["Entity Discount Amount"]),
    tax: round2(lines.reduce((s, l) => s + num(l["Item Tax Amount"]), 0)),
    shipping: num(head["Shipping Charge"]),
    adjustment: num(head["Adjustment"]),
    total: num(head["Total"]),
    notes: str(head, "Notes"),
    terms: str(head, "Terms & Conditions"),
    lines: lines.map((l) => {
      const itemName = str(l, "Item Name");
      const itemDesc = str(l, "Item Desc");
      return {
        name: itemName || itemDesc,
        description: itemName ? itemDesc : "",
        itemName,
        quantity: num(l["Quantity"]),
        rate: num(l["Item Price"]),
        discount: num(l["Discount"]),
        tax: num(l["Item Tax %"]),
        amount: num(l["Item Total"]),
      };
    }),
  };
};

const mapPayment = (lines: CsvRow[]): PaymentDraft => {
  const head = lines[0];
  return {
    paymentNumber: str(head, "Payment Number"),
    customerName: str(head, "Customer Name"),
    paymentDate: str(head, "Date"),
    paymentMode: str(head, "Mode") || "Cash",
    referenceNo: str(head, "Reference Number"),
    currency: str(head, "Currency Code") || "PKR",
    amount: num(head["Amount"]),
    bankCharges: num(head["Bank Charges"]),
    status: str(head, "Payment Status") || "Paid",
    notes: str(head, "Description"),
    createdTime: str(head, "Created Time"),
    applied: lines
      .filter((l) => str(l, "Invoice Number") && num(l["Amount Applied to Invoice"]) > 0)
      .map((l) => ({
        invoiceNumber: str(l, "Invoice Number"),
        amount: num(l["Amount Applied to Invoice"]),
      })),
  };
};

/** Maps Zoho Books CSV exports to editable draft records (no database access). */
export const buildDrafts = (files: ImportFiles): ImportDrafts => {
  const drafts: ImportDrafts = {};
  if (files.contacts) {
    drafts.customers = parseCsv(files.contacts).map(mapCustomer).filter((c) => c.displayName);
  }
  if (files.items) {
    drafts.items = parseCsv(files.items).map(mapItem).filter((i) => i.name);
  }
  if (files.projects) {
    drafts.projects = parseCsv(files.projects).map(mapProject).filter((p) => p.name);
  }
  if (files.quotes) {
    drafts.quotes = groupBy(parseCsv(files.quotes), (r) => str(r, "Quote Number")).map(mapQuote);
  }
  if (files.invoices) {
    drafts.invoices = groupBy(parseCsv(files.invoices), (r) => str(r, "Invoice Number")).map(mapInvoice);
  }
  if (files.payments) {
    drafts.payments = groupBy(
      parseCsv(files.payments),
      (r) => str(r, "CustomerPayment ID") || str(r, "Payment Number"),
    ).map(mapPayment);
  }
  return drafts;
};
