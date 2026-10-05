import InvoiceForm from "@/components/Invoices/InvoiceForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Edit Invoice", "Update this invoice's customer, line items, dates and terms.");


export default function EditInvoicePage() {
  return <InvoiceForm />;
}
