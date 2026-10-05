import InvoiceForm from "@/components/Invoices/InvoiceForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("New Invoice", "Create an invoice with line items, discount, payment terms and notes.");


export default function NewInvoicePage() {
  return <InvoiceForm />;
}
