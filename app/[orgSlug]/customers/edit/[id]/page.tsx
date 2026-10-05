import CustomerForm from "@/components/customer/CustomerForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Edit Customer", "Update this customer's details, contacts and documents.");


const EditCustomerPage = () => <CustomerForm />;

export default EditCustomerPage;
