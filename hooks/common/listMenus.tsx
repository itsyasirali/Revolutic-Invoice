"use client";

import useListMenu, { type ExportColumn, type SortField } from "@/hooks/common/useListMenu";
import {
  invalidateCustomers,
  invalidateExpenses,
  invalidateInvoices,
  invalidateItems,
  invalidatePayments,
  invalidateProjects,
  invalidateQuotes,
} from "@/lib/swr";
import { customerLabel, formatDate } from "@/lib/format";
import type { Customer } from "@/types/customer";
import type { UIInvoiceListItem } from "@/hooks/invoices/useInvoicesData";
import type { Expense } from "@/types/expense";
import type { Item } from "@/types/item";
import type { Payment } from "@/types/payment";
import type { Project } from "@/types/project";
import type { Quote } from "@/types/quote";

const time = (v: unknown) => {
  const t = v ? new Date(String(v)).getTime() : NaN;
  return Number.isNaN(t) ? null : t;
};

// ---------------------------------------------------------------- customers
const customerSort: SortField<Customer>[] = [
  { label: "Name", value: "name", get: (c) => c.displayName },
  { label: "Company Name", value: "company", get: (c) => c.companyName },
  { label: "Receivables", value: "receivables", get: (c) => Number(c.receivables ?? 0) },
  { label: "Created Time", value: "created", get: (c) => time(c.createdAt) },
];
/** Contacts after the first one, as "First Last <email> phone" separated by "; " (empty if there is only one). */
const additionalContacts = (c: Customer) =>
  (c.contacts ?? [])
    .slice(1)
    .map((p) => [`${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(), p.email ? `<${p.email}>` : "", p.contact ?? ""].filter(Boolean).join(" "))
    .filter(Boolean)
    .join("; ");

const customerExport: ExportColumn<Customer>[] = [
  { header: "Display Name", get: (c) => c.displayName },
  { header: "Company Name", get: (c) => c.companyName },
  { header: "Customer Type", get: (c) => c.customerType },
  { header: "Contact First Name", get: (c) => c.contacts?.[0]?.firstName },
  { header: "Contact Last Name", get: (c) => c.contacts?.[0]?.lastName },
  { header: "Contact Email", get: (c) => c.contacts?.[0]?.email },
  { header: "Contact Phone", get: (c) => c.contacts?.[0]?.contact },
  { header: "Additional Contacts", get: (c) => additionalContacts(c) },
  { header: "Currency", get: (c) => c.currency },
  { header: "Status", get: (c) => c.status },
  { header: "Receivables", get: (c) => c.receivables },
  { header: "Address", get: (c) => c.address },
  { header: "Created Time", get: (c) => formatDate(c.createdAt) },
];
export const useCustomerListMenu = (rows: Customer[]) =>
  useListMenu({
    rows,
    sortFields: customerSort,
    exportColumns: customerExport,
    filename: "customers",
    importKind: "contacts",
    importLabel: "Import Customers",
    onRefresh: invalidateCustomers,
  });

// -------------------------------------------------------------------- items
const itemSort: SortField<Item>[] = [
  { label: "Name", value: "name", get: (i) => i.name },
  { label: "Selling Price", value: "price", get: (i) => Number(i.sellingPrice ?? 0) },
  { label: "Unit", value: "unit", get: (i) => i.unit },
  { label: "Created Time", value: "created", get: (i) => time(i.createdAt) },
];
const itemExport: ExportColumn<Item>[] = [
  { header: "Item Name", get: (i) => i.name },
  { header: "Type", get: (i) => i.type },
  { header: "Unit", get: (i) => i.unit },
  { header: "Selling Price", get: (i) => i.sellingPrice },
  { header: "Description", get: (i) => i.description },
  { header: "Status", get: (i) => i.status },
];
export const useItemListMenu = (rows: Item[]) =>
  useListMenu({
    rows,
    sortFields: itemSort,
    exportColumns: itemExport,
    filename: "items",
    importKind: "items",
    importLabel: "Import Items",
    onRefresh: invalidateItems,
  });

// ----------------------------------------------------------------- invoices
type InvoiceRaw = { invoiceDate?: string; dueDate?: string; currency?: string };
const raw = (i: UIInvoiceListItem) => (i.raw ?? {}) as InvoiceRaw;
const invoiceSort: SortField<UIInvoiceListItem>[] = [
  { label: "Invoice Number", value: "number", get: (i) => i.invoice },
  { label: "Customer Name", value: "customer", get: (i) => i.name },
  { label: "Date", value: "date", get: (i) => time(raw(i).invoiceDate) },
  { label: "Due Date", value: "due", get: (i) => time(raw(i).dueDate) },
  { label: "Amount", value: "amount", get: (i) => parseFloat(String(i.amount).replace(/,/g, "")) || 0 },
];
const invoiceExport: ExportColumn<UIInvoiceListItem>[] = [
  { header: "Invoice Number", get: (i) => i.invoice },
  { header: "Customer Name", get: (i) => i.name },
  { header: "Email", get: (i) => i.email },
  { header: "Date", get: (i) => formatDate(raw(i).invoiceDate) },
  { header: "Due Date", get: (i) => formatDate(raw(i).dueDate) },
  { header: "Amount", get: (i) => i.amount },
  { header: "Currency", get: (i) => i.currency ?? raw(i).currency },
  { header: "Status", get: (i) => i.status?.tooltip },
];
export const useInvoiceListMenu = (rows: UIInvoiceListItem[]) =>
  useListMenu({
    rows,
    sortFields: invoiceSort,
    exportColumns: invoiceExport,
    filename: "invoices",
    importKind: "invoices",
    importLabel: "Import Invoices",
    onRefresh: invalidateInvoices,
  });

// ----------------------------------------------------------------- payments
const paymentSort: SortField<Payment>[] = [
  { label: "Date", value: "date", get: (p) => time(p.paymentDate) },
  { label: "Payment Number", value: "number", get: (p) => Number(p.paymentNumber ?? 0) },
  { label: "Customer Name", value: "customer", get: (p) => p.customerDisplayName },
  { label: "Amount", value: "amount", get: (p) => Number(p.amountReceived ?? 0) },
];
const paymentExport: ExportColumn<Payment>[] = [
  { header: "Date", get: (p) => formatDate(p.paymentDate) },
  { header: "Payment Number", get: (p) => p.paymentNumber },
  { header: "Reference Number", get: (p) => p.referenceNo },
  { header: "Customer Name", get: (p) => p.customerDisplayName },
  { header: "Payment Mode", get: (p) => p.paymentMode },
  { header: "Amount", get: (p) => p.amountReceived },
  { header: "Bank Charges", get: (p) => p.bankCharges },
  { header: "Currency", get: (p) => p.currency },
  { header: "Status", get: (p) => p.status },
];
export const usePaymentListMenu = (rows: Payment[]) =>
  useListMenu({
    rows,
    sortFields: paymentSort,
    exportColumns: paymentExport,
    filename: "payments",
    importKind: "payments",
    importLabel: "Import Payments",
    onRefresh: invalidatePayments,
  });

// ------------------------------------------------------------------- quotes
const quoteSort: SortField<Quote>[] = [
  { label: "Quote Number", value: "number", get: (q) => q.quoteNumber },
  { label: "Customer Name", value: "customer", get: (q) => customerLabel(q.customer) },
  { label: "Date", value: "date", get: (q) => time(q.quoteDate) },
  { label: "Expiry Date", value: "expiry", get: (q) => time(q.expiryDate) },
  { label: "Amount", value: "amount", get: (q) => Number(q.total ?? 0) },
];
const quoteExport: ExportColumn<Quote>[] = [
  { header: "Quote Number", get: (q) => q.quoteNumber },
  { header: "Customer Name", get: (q) => customerLabel(q.customer) },
  { header: "Date", get: (q) => formatDate(q.quoteDate) },
  { header: "Expiry Date", get: (q) => formatDate(q.expiryDate) },
  { header: "Reference", get: (q) => q.referenceNumber },
  { header: "Total", get: (q) => q.total },
  { header: "Currency", get: (q) => q.currency },
  { header: "Status", get: (q) => q.status },
];
export const useQuoteListMenu = (rows: Quote[]) =>
  useListMenu({
    rows,
    sortFields: quoteSort,
    exportColumns: quoteExport,
    filename: "quotes",
    importKind: "quotes",
    importLabel: "Import Quotes",
    onRefresh: invalidateQuotes,
  });

// ----------------------------------------------------------------- projects
const projectSort: SortField<Project>[] = [
  { label: "Project Name", value: "name", get: (p) => p.name },
  { label: "Project Code", value: "code", get: (p) => p.projectNumber },
  { label: "Customer Name", value: "customer", get: (p) => customerLabel(p.customer) },
  { label: "Status", value: "status", get: (p) => p.status },
  { label: "Created Time", value: "created", get: (p) => time((p as { createdAt?: string }).createdAt) },
];
const projectExport: ExportColumn<Project>[] = [
  { header: "Project Name", get: (p) => p.name },
  { header: "Project Code", get: (p) => p.projectNumber },
  { header: "Customer Name", get: (p) => customerLabel(p.customer) },
  { header: "Status", get: (p) => p.status },
  { header: "Billing Method", get: (p) => p.billingMethod },
  { header: "Hourly Rate", get: (p) => p.hourlyRate },
  { header: "Fixed Amount", get: (p) => p.fixedAmount },
  { header: "Budget Hours", get: (p) => p.budgetHours },
  { header: "Budget Amount", get: (p) => p.budgetAmount },
  { header: "Currency", get: (p) => p.currency },
  { header: "Description", get: (p) => p.description },
];
export const useProjectListMenu = (rows: Project[]) =>
  useListMenu({
    rows,
    sortFields: projectSort,
    exportColumns: projectExport,
    filename: "projects",
    importKind: "projects",
    importLabel: "Import Projects",
    onRefresh: invalidateProjects,
  });

// ----------------------------------------------------------------- expenses
const expenseSort: SortField<Expense>[] = [
  { label: "Date", value: "date", get: (e) => time(e.expenseDate) },
  { label: "Expense #", value: "number", get: (e) => e.expenseNumber },
  { label: "Vendor", value: "vendor", get: (e) => e.vendor },
  { label: "Customer Name", value: "customer", get: (e) => customerLabel(e.customer) },
  { label: "Category", value: "category", get: (e) => e.category?.name },
  { label: "Amount", value: "amount", get: (e) => Number(e.total ?? 0) },
  { label: "Status", value: "status", get: (e) => e.status },
];
const expenseExport: ExportColumn<Expense>[] = [
  { header: "Expense #", get: (e) => e.expenseNumber },
  { header: "Date", get: (e) => formatDate(e.expenseDate) },
  { header: "Vendor", get: (e) => e.vendor },
  { header: "Customer", get: (e) => customerLabel(e.customer) },
  { header: "Category", get: (e) => e.category?.name },
  { header: "Description", get: (e) => e.description },
  { header: "Amount", get: (e) => e.amount },
  { header: "Tax", get: (e) => e.tax },
  { header: "Total", get: (e) => e.total },
  { header: "Currency", get: (e) => e.currency },
  { header: "Payment Method", get: (e) => e.paymentMethod },
  { header: "Reference", get: (e) => e.referenceNumber },
  { header: "Billable", get: (e) => (e.billable ? "Yes" : "No") },
  { header: "Status", get: (e) => e.status },
];
export const useExpenseListMenu = (rows: Expense[]) =>
  useListMenu({
    rows,
    sortFields: expenseSort,
    exportColumns: expenseExport,
    filename: "expenses",
    onRefresh: invalidateExpenses,
  });
