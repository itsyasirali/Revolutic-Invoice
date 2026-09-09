import InvoiceList from "@/components/Invoices/InvoiceList";
import fetchInvoicesForUser from "@/lib/services/invoicesService";
import { getServerSessionUser } from "@/lib/session";

const InvoicesPage = async () => {
  const user = await getServerSessionUser();
  const invoices = user?.id ? await fetchInvoicesForUser(Number(user.id)) : [];

  return <InvoiceList initialInvoices={invoices} />;
};

export default InvoicesPage;
