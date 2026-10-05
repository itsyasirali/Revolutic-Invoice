import InvoiceList from "@/components/Invoices/InvoiceList";
import fetchInvoicesForUser from "@/lib/services/invoicesService";
import { getServerSessionUser } from "@/lib/session";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Invoices", "Create, send and track invoices, and see what is paid, overdue or still outstanding.");


const InvoicesPage = async () => {
  const user = await getServerSessionUser();
  const orgId = user?.organizationId ? Number(user.organizationId) : null;
  const invoices = user?.id ? await fetchInvoicesForUser(Number(user.id), orgId) : [];

  return <InvoiceList initialInvoices={invoices} />;
};

export default InvoicesPage;
