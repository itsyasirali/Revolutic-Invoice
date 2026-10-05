import CustomerList from "@/components/customer/CustomerList";
import fetchCustomersForUser from "@/lib/services/customersService";
import { getServerSessionUser } from "@/lib/session";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Customers", "View and manage your customers, their contacts, documents and outstanding balances.");


const CustomersPage = async () => {
  const user = await getServerSessionUser();
  const orgId = user?.organizationId ? Number(user.organizationId) : null;
  const customers = user?.id ? await fetchCustomersForUser(Number(user.id), orgId) : [];

  return <CustomerList initialCustomers={customers} />;
};

export default CustomersPage;
