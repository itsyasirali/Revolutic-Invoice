import InvoiceList from "@/components/Invoices/InvoiceList";
import fetchInvoicesForUser from "@/lib/services/invoicesService";
import { getServerSessionUser } from "@/lib/session";

const InvoicesPage = async () => {
  const user = await getServerSessionUser();
  const orgId = user?.organizationId ? Number(user.organizationId) : null;
  const invoices = user?.id ? await fetchInvoicesForUser(Number(user.id), orgId) : [];

  return <InvoiceList initialInvoices={invoices} />;
};

export default InvoicesPage;
