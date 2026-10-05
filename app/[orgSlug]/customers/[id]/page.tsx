import CustomerSplitView from "@/components/customer/CustomerSplitView";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Customer Details", "Customer profile with contacts, documents, invoices, quotes, expenses, time entries and payment history.");

// No server-side data fetch here: the list is already in the client cache and the
// opened record comes from it, so the detail view renders instantly on click.
const DetailsPage = () => <CustomerSplitView />;

export default DetailsPage;
