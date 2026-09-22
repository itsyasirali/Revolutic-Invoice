export type PlaceholderScope = "invoice" | "payment";

export type PlaceholderGroup =
  | "Customer"
  | "Invoice"
  | "Payment"
  | "Organization"
  | "Sender"
  | "Dates";

export interface PlaceholderDef {
  key: string;
  label: string;
  group: PlaceholderGroup;
  scope: PlaceholderScope[];
}

const both: PlaceholderScope[] = ["invoice", "payment"];
const inv: PlaceholderScope[] = ["invoice"];
const pay: PlaceholderScope[] = ["payment"];

const def = (
  group: PlaceholderGroup,
  scope: PlaceholderScope[],
  key: string,
  label: string,
): PlaceholderDef => ({ key, label, group, scope });

/** Suffixes appended to a date prefix (Current, Invoice, Due, Payment). */
export const DATE_PART_SUFFIXES: [string, string][] = [
  ["Day", "day"],
  ["Month", "month number"],
  ["MonthName", "month name"],
  ["MonthShort", "month (short)"],
  ["Year", "year"],
  ["Weekday", "weekday"],
];

const dateParts = (
  prefix: string,
  noun: string,
  scope: PlaceholderScope[],
): PlaceholderDef[] =>
  DATE_PART_SUFFIXES.map(([suffix, what]) =>
    def("Dates", scope, `${prefix}${suffix}`, `${noun} ${what}`),
  );

export const PLACEHOLDER_DEFS: PlaceholderDef[] = [
  // Customer
  def("Customer", both, "CustomerName", "Customer name"),
  def("Customer", both, "CustomerFirstName", "Customer first name"),
  def("Customer", both, "CompanyName", "Customer company"),
  def("Customer", both, "CustomerEmail", "Customer email"),
  def("Customer", both, "CustomerPhone", "Customer phone"),
  def("Customer", both, "CustomerAddress", "Customer address"),
  def("Customer", both, "CustomerType", "Customer type"),

  // Invoice
  def("Invoice", inv, "InvoiceNumber", "Invoice number"),
  def("Invoice", inv, "InvoiceStatus", "Invoice status"),
  def("Invoice", inv, "InvoiceDate", "Invoice date"),
  def("Invoice", inv, "DueDate", "Due date"),
  def("Invoice", inv, "InvoiceAmount", "Invoice total"),
  def("Invoice", inv, "InvoiceSubTotal", "Invoice sub total"),
  def("Invoice", inv, "InvoiceDiscount", "Discount amount"),
  def("Invoice", inv, "InvoiceDiscountPercent", "Discount percent"),
  def("Invoice", inv, "InvoicePaid", "Amount paid"),
  def("Invoice", inv, "InvoiceBalance", "Invoice balance"),
  def("Invoice", inv, "PreviousBalance", "Previous outstanding balance"),
  def("Invoice", inv, "TotalBalanceDue", "Total balance due"),
  def("Invoice", inv, "ItemCount", "Number of line items"),
  def("Invoice", inv, "PaymentTerms", "Payment terms (e.g. Net 30)"),
  def("Invoice", inv, "DaysUntilDue", "Days until due"),
  def("Invoice", inv, "DaysOverdue", "Days overdue"),
  def("Invoice", both, "Currency", "Currency code"),

  // Payment
  def("Payment", pay, "PaymentNumber", "Payment number"),
  def("Payment", pay, "PaymentAmount", "Amount received"),
  def("Payment", pay, "PaymentDate", "Payment date"),
  def("Payment", pay, "PaymentMode", "Payment mode"),
  def("Payment", pay, "PaymentReference", "Reference number"),
  def("Payment", pay, "PaymentStatus", "Payment status"),
  def("Payment", pay, "BankCharges", "Bank charges"),
  def("Payment", pay, "PaymentInvoiceNumbers", "Applied invoice numbers"),

  // Organization
  def("Organization", both, "OrganizationName", "Your organization"),
  def("Organization", both, "OrganizationEmail", "Organization email"),
  def("Organization", both, "OrganizationPhone", "Organization phone"),
  def("Organization", both, "OrganizationAddress", "Organization address"),
  def("Organization", both, "OrganizationWebsite", "Organization website"),
  def("Organization", both, "OrganizationCity", "Organization city"),
  def("Organization", both, "OrganizationCountry", "Organization country"),

  // Sender
  def("Sender", both, "Sender", "Sender name"),
  def("Sender", both, "SenderFirstName", "Sender first name"),
  def("Sender", both, "SenderEmail", "Sender email"),

  // Dates (relative to the document date, or today)
  def("Dates", both, "MONTH", "Month name"),
  def("Dates", both, "MONTHNUM", "Month number"),
  def("Dates", both, "YEAR", "Year"),
  def("Dates", both, "DAY", "Day of month"),
  def("Dates", both, "CurrentDate", "Today's date"),
  ...([-3, -2, -1, 1, 2, 3] as const).map((n) =>
    def(
      "Dates",
      both,
      `(MONTH${n > 0 ? "+" : ""}${n})`,
      `Month name, ${n > 0 ? `${n} month${n > 1 ? "s" : ""} ahead` : `${-n} month${n < -1 ? "s" : ""} ago`}`,
    ),
  ),
  ...([-3, -2, -1, 1, 2, 3] as const).map((n) =>
    def(
      "Dates",
      both,
      `(YEAR${n > 0 ? "+" : ""}${n})`,
      `Year, ${n > 0 ? `${n} year${n > 1 ? "s" : ""} ahead` : `${-n} year${n < -1 ? "s" : ""} ago`}`,
    ),
  ),
  ...dateParts("Current", "Today's", both),
  ...dateParts("Invoice", "Invoice", inv),
  ...dateParts("Due", "Due", inv),
  ...dateParts("Payment", "Payment", pay),
];

export const RESERVED_KEYS = new Set(PLACEHOLDER_DEFS.map((d) => d.key.toLowerCase()));

export const CUSTOM_KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_]{1,39}$/;

export interface CustomPlaceholderLike {
  key: string;
  label?: string;
  value: string;
}

export const validateCustomKey = (key: string): string | null => {
  if (!CUSTOM_KEY_PATTERN.test(key)) {
    return "Key must be 2-40 characters: letters, numbers, underscores, starting with a letter";
  }
  if (RESERVED_KEYS.has(key.toLowerCase())) {
    return "This name is reserved for a built-in placeholder";
  }
  return null;
};
