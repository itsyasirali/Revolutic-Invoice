import CustomerSplitView from "@/components/customer/CustomerSplitView";
import fetchCustomersForUser from "@/lib/services/customersService";
import { getServerSessionUser } from "@/lib/session";

const CustomerDetailsPage = async () => {
  const user = await getServerSessionUser();
  const orgId = user?.organizationId ? Number(user.organizationId) : null;
  const customers = user?.id ? await fetchCustomersForUser(Number(user.id), orgId) : [];

  return <CustomerSplitView initialCustomers={customers} />;
};

export default CustomerDetailsPage;
