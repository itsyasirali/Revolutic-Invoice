import { parseCsvRecords, type CsvRow } from "@/lib/csv";
import type {
  CustomerDraft,
  ImportDrafts,
  InvoiceDraft,
  ItemDraft,
  PaymentDraft,
  ProjectDraft,
  QuoteDraft,
} from "./types";

export class ImportFormatError extends Error {}

export interface ImportFiles {
  contacts?: string;
  items?: string;
  projects?: string;
  quotes?: string;
  invoices?: string;
  payments?: string;
}

// Canonical (Zoho) column name -> other names commonly used by other tools.
const HEADER_ALIASES: Record<string, string[]> = {
  "Display Name": ["Name", "Customer", "Contact Name", "Full Name", "Client", "Client Name"],
  "Company Name": ["Company", "Organization", "Business Name"],
  "EmailID": ["Email", "Email Address", "E-mail", "Contact Email"],
  "MobilePhone": ["Mobile", "Cell"],
  "Phone": ["Phone Number", "Telephone", "Tel"],
  "Billing Address": ["Address", "Street Address"],
  "Billing City": ["City"],
  "Billing State": ["State", "Province"],
  "Billing Country": ["Country"],
  "Billing Code": ["Zip", "Zip Code", "Postal Code", "Postcode"],
  "Currency Code": ["Currency"],
  "Notes": ["Note", "Remarks", "Memo"],
  "Item Name": ["Item", "Product", "Product Name", "Service", "Name"],
  "Item Desc": ["Item Description", "Line Description"],
  "Description": ["Details"],
  "Rate": ["Price", "Selling Price", "Unit Price", "Unit Cost"],
  "Usage unit": ["Unit", "Units", "UOM"],
  "Product Type": ["Type", "Item Type"],
  "Invoice Number": ["Invoice No", "Invoice #", "Invoice Num", "Invoice ID", "Number"],
  "Invoice Date": ["Date", "Issue Date", "Issued"],
  "Due Date": ["Due", "Payment Due"],
  "Invoice Status": ["Status"],
  "Customer Name": ["Customer", "Client", "Client Name", "Bill To"],
  "SubTotal": ["Sub Total", "Subtotal"],
  "Total": ["Amount", "Grand Total", "Invoice Total"],
  "Balance": ["Amount Due", "Balance Due", "Outstanding"],
  "Quantity": ["Qty"],
  "Item Price": ["Unit Price", "Price", "Item Rate"],
  "Item Total": ["Line Total", "Line Amount"],
  "Quote Number": ["Quote No", "Quote #", "Estimate Number", "Estimate No"],
  "Quote Date": ["Estimate Date"],
  "Quote Status": ["Status"],
  "Expiry Date": ["Valid Until", "Expiration Date"],
  "Project Name": ["Project"],
  "Payment Number": ["Payment No", "Payment #", "Receipt Number"],
  "Mode": ["Payment Mode", "Payment Method", "Method"],
  "Reference Number": ["Reference", "Reference No", "Ref"],
  "Amount": ["Payment Amount", "Amount Received"],
  "Amount Applied to Invoice": ["Applied Amount", "Amount Applied"],
  "Date": ["Payment Date"],
};

const normHeader = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, "");

const CANONICAL_BY_NORM = new Map(
  Object.keys(HEADER_ALIASES).map((c) => [normHeader(c), [c]] as const),
);

// An alias can stand for several canonical columns (e.g. "Name").
const ALIAS_LOOKUP = (() => {
  const map = new Map<string, string[]>();
  for (const [canonical, aliases] of Object.entries(HEADER_ALIASES)) {
    for (const alias of aliases) {
      const key = normHeader(alias);
      map.set(key, [...(map.get(key) ?? []), canonical]);
    }
  }
  return map;
})();

/**
 * Parses a CSV and adds canonical (Zoho) column names for headers that match
 * case/punctuation-insensitively or via a known alias, so exports from other
 * tools map the same way. Exact headers always take precedence.
 */
const parseCsv = (text: string): CsvRow[] =>
  parseCsvRecords(text).map((row) => {
    const out: CsvRow = { ...row };
    for (const [key, value] of Object.entries(row)) {
      const norm = normHeader(key);
      const canonicals = CANONICAL_BY_NORM.get(norm) ?? ALIAS_LOOKUP.get(norm) ?? [];
      for (const canonical of canonicals) {
        if (!(out[canonical] ?? "").trim()) out[canonical] = value;
      }
    }
    return out;
  });

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
  const empty = (Object.keys(files) as (keyof ImportFiles)[]).filter((k) => {
    const d = drafts[{ contacts: "customers", items: "items", projects: "projects", quotes: "quotes", invoices: "invoices", payments: "payments" }[k] as keyof ImportDrafts];
    return files[k] && (!d || d.length === 0);
  });
  if (empty.length > 0) {
    throw new ImportFormatError(
      `No importable records found in: ${empty.join(", ")}. Make sure the first row contains column headers such as Name, Email, Invoice Number, Date and Total.`,
    );
  }
  return drafts;
};
