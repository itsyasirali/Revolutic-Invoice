import CustomerForm from "@/components/customer/CustomerForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("New Customer", "Add a customer with their contact details, currency, address and documents.");


const NewCustomerPage = () => <CustomerForm />;

export default NewCustomerPage;
