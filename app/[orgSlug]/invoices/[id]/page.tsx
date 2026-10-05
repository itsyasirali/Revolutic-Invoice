import InvoiceSplitView from "@/components/Invoices/InvoiceSplitView";
import fetchInvoicesForUser from "@/lib/services/invoicesService";
import { getServerSessionUser } from "@/lib/session";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Invoice Details", "Invoice overview with line items, balance due, write-offs, activity and customer comments.");


export default async function InvoiceDetailsPage() {
  const user = await getServerSessionUser();
  const orgId = user?.organizationId ? Number(user.organizationId) : null;
  const invoices = user?.id ? await fetchInvoicesForUser(Number(user.id), orgId) : [];

  return <InvoiceSplitView initialInvoices={invoices} />;
}
