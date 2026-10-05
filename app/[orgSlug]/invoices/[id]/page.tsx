import InvoiceSplitView from "@/components/Invoices/InvoiceSplitView";
import fetchInvoicesForUser from "@/lib/services/invoicesService";
import { getServerSessionUser } from "@/lib/session";

export default async function InvoiceDetailsPage() {
  const user = await getServerSessionUser();
  const orgId = user?.organizationId ? Number(user.organizationId) : null;
  const invoices = user?.id ? await fetchInvoicesForUser(Number(user.id), orgId) : [];

  return <InvoiceSplitView initialInvoices={invoices} />;
}
