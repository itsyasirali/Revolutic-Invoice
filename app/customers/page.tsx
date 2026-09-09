import CustomerList from "@/components/customer/CustomerList";
import fetchCustomersForUser from "@/lib/services/customersService";
import { getServerSessionUser } from "@/lib/session";

const CustomersPage = async () => {
  const user = await getServerSessionUser();
  const customers = user?.id ? await fetchCustomersForUser(Number(user.id)) : [];

  return <CustomerList initialCustomers={customers} />;
};

export default CustomersPage;
