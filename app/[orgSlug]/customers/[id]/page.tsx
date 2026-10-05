import CustomerSplitView from "@/components/customer/CustomerSplitView";
import fetchCustomersForUser from "@/lib/services/customersService";
import { getServerSessionUser } from "@/lib/session";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Customer Details", "Customer profile with contacts, documents, invoices, quotes, expenses, time entries and payment history.");


const CustomerDetailsPage = async () => {
  const user = await getServerSessionUser();
  const orgId = user?.organizationId ? Number(user.organizationId) : null;
  const customers = user?.id ? await fetchCustomersForUser(Number(user.id), orgId) : [];

  return <CustomerSplitView initialCustomers={customers} />;
};

export default CustomerDetailsPage;
