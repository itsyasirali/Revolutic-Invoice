import {
  DATE_PART_SUFFIXES,
  type CustomPlaceholderLike,
  type PlaceholderScope,
} from "./registry";
import { BASE_DATE_KEY, type PlaceholderValues } from "./replace";

const parseDate = (d: unknown): Date | null => {
  if (!d) return null;
  const date = new Date(d as string);
  return isNaN(date.getTime()) ? null : date;
};

const fmtDate = (d: unknown): string => {
  const date = parseDate(d);
  return date ? date.toLocaleDateString() : "N/A";
};

const fmtMoney = (n: unknown): string => (Number(n) || 0).toFixed(2);

const dateParts = (prefix: string, d: unknown): PlaceholderValues => {
  const date = parseDate(d);
  const partValues: Record<string, string> = date
    ? {
        Day: String(date.getDate()).padStart(2, "0"),
        Month: String(date.getMonth() + 1).padStart(2, "0"),
        MonthName: date.toLocaleString("en-US", { month: "long" }),
        MonthShort: date.toLocaleString("en-US", { month: "short" }),
        Year: String(date.getFullYear()),
        Weekday: date.toLocaleString("en-US", { weekday: "long" }),
      }
    : {};
  const out: PlaceholderValues = {};
  for (const [suffix] of DATE_PART_SUFFIXES) {
    out[`${prefix}${suffix}`] = partValues[suffix] ?? "";
  }
  return out;
};

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const paymentTermsLabel = (invoice: any): string => {
  if (invoice.terms) return String(invoice.terms);
  const a = parseDate(invoice.invoiceDate);
  const b = parseDate(invoice.dueDate);
  if (!a || !b) return "";
  const days = Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
  return days <= 0 ? "Due on receipt" : `Net ${days}`;
};

export interface PlaceholderOrganization {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  city?: string | null;
  businessLocation?: string | null;
}

export interface PlaceholderSender {
  name?: string | null;
  firstName?: string | null;
  email?: string | null;
}

export interface PlaceholderInput {
  scope: PlaceholderScope;
  invoice?: any;
  payment?: any;
  organization?: PlaceholderOrganization | null;
  /** Fallback when `organization` has no name. */
  organizationName?: string | null;
  sender?: PlaceholderSender | null;
  /** Fallback when `sender` has no name. */
  senderName?: string | null;
  custom?: CustomPlaceholderLike[];
  now?: Date;
}

export const buildPlaceholderValues = ({
  scope,
  invoice,
  payment,
  organization,
  organizationName,
  sender,
  senderName,
  custom = [],
  now = new Date(),
}: PlaceholderInput): PlaceholderValues => {
  const source = scope === "invoice" ? invoice : payment;
  // `customerId` is usually just the raw foreign-key id (a number), not the
  // populated relation — only treat it as the customer record when it has
  // actually been expanded into an object, otherwise fall back to `{}` so
  // fields like CompanyName resolve to "" instead of reading off a primitive.
  const rawCustomer = source?.customer ?? source?.customerId;
  const customer =
    rawCustomer && typeof rawCustomer === "object" ? rawCustomer : {};
  const contact = Array.isArray(customer.contacts) ? customer.contacts[0] : undefined;
  const customerName =
    source?.customerDisplayName ||
    source?.customerName ||
    customer.displayName ||
    "Customer";
  const senderFull = sender?.name || sender?.firstName || senderName || "";

  const values: PlaceholderValues = {};

  // Custom values first so built-ins always win on any collision.
  for (const c of custom) values[c.key] = c.value ?? "";

  Object.assign(values, {
    CustomerName: customerName,
    CustomerFirstName: contact?.firstName || String(customerName).split(/\s+/)[0] || "",
    CompanyName: customer.companyName || "",
    CustomerEmail: source?.customerEmail || customer.email || contact?.email || "",
    CustomerPhone: customer.phone || contact?.contact || "",
    CustomerAddress: source?.customerAddress || customer.address || "",
    CustomerType: customer.customerType || "",
    Currency: source?.currency || "PKR",

    OrganizationName: organization?.name || organizationName || "",
    OrganizationEmail: organization?.email || "",
    OrganizationPhone: organization?.phone || "",
    OrganizationAddress: organization?.address || "",
    OrganizationWebsite: organization?.website || "",
    OrganizationCity: organization?.city || "",
    OrganizationCountry: organization?.businessLocation || "",

    Sender: senderFull || "Team",
    SenderFirstName: sender?.firstName || senderFull.split(/\s+/)[0] || "",
    SenderEmail: sender?.email || "",

    CurrentDate: now.toLocaleDateString(),
    ...dateParts("Current", now),
  });

  // Base date for MONTH / YEAR / DAY and %(MONTH-1)% expressions:
  // the document date when present, otherwise today.
  const baseDate =
    parseDate(scope === "invoice" ? invoice?.invoiceDate : payment?.paymentDate) ?? now;
  Object.assign(values, {
    [BASE_DATE_KEY]: baseDate.toISOString(),
    MONTH: baseDate.toLocaleString("en-US", { month: "long" }),
    MONTHNAME: baseDate.toLocaleString("en-US", { month: "long" }),
    MONTHSHORT: baseDate.toLocaleString("en-US", { month: "short" }),
    MONTHNUM: String(baseDate.getMonth() + 1).padStart(2, "0"),
    YEAR: String(baseDate.getFullYear()),
    DAY: String(baseDate.getDate()).padStart(2, "0"),
  });

  if (scope === "invoice" && invoice) {
    const current =
      invoice.remaining !== undefined && invoice.remaining !== null
        ? Number(invoice.remaining)
        : Number(invoice.total) || 0;
    const previous = Number(invoice.previousRemaining) || 0;
    const subTotal = Number(invoice.subTotal ?? invoice.subtotal) || 0;
    const discountPercent = Number(invoice.discountPercent) || 0;
    const due = parseDate(invoice.dueDate);
    const daysDiff = due
      ? Math.round((startOfDay(due) - startOfDay(now)) / 86400000)
      : null;

    Object.assign(values, {
      InvoiceNumber: String(invoice.invoiceNumber ?? ""),
      InvoiceStatus: invoice.status || "",
      InvoiceDate: fmtDate(invoice.invoiceDate),
      DueDate: fmtDate(invoice.dueDate),
      InvoiceAmount: fmtMoney(invoice.total),
      InvoiceSubTotal: fmtMoney(subTotal),
      InvoiceDiscount: fmtMoney((subTotal * discountPercent) / 100),
      InvoiceDiscountPercent: String(discountPercent),
      InvoicePaid: fmtMoney(invoice.received),
      InvoiceBalance: fmtMoney(current),
      PreviousBalance: fmtMoney(previous),
      TotalBalanceDue: fmtMoney(current + previous),
      ItemCount: String(Array.isArray(invoice.items) ? invoice.items.length : 0),
      PaymentTerms: paymentTermsLabel(invoice),
      DaysUntilDue: daysDiff === null ? "" : String(Math.max(daysDiff, 0)),
      DaysOverdue: daysDiff === null ? "" : String(Math.max(-daysDiff, 0)),
      ...dateParts("Invoice", invoice.invoiceDate),
      ...dateParts("Due", invoice.dueDate),
    });
  }

  if (scope === "payment" && payment) {
    const applied = Array.isArray(payment.appliedInvoices)
      ? payment.appliedInvoices
          .map((a: any) => a?.invoice?.invoiceNumber)
          .filter(Boolean)
          .join(", ")
      : "";
    Object.assign(values, {
      PaymentNumber: String(payment.paymentNumber ?? "DRAFT"),
      PaymentAmount: fmtMoney(payment.amountReceived),
      PaymentDate: fmtDate(payment.paymentDate),
      PaymentMode: payment.paymentMode || "",
      PaymentReference: payment.referenceNo || "",
      PaymentStatus: payment.status || "",
      BankCharges: fmtMoney(payment.bankCharges),
      PaymentInvoiceNumbers: applied,
      ...dateParts("Payment", payment.paymentDate),
    });
  }

  return values;
};
