import InvoiceSplitView from "@/components/Invoices/InvoiceSplitView";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Invoice Details", "Invoice overview with line items, balance due, write-offs, activity and customer comments.");

// No server-side data fetch here: the list is already in the client cache and the
// opened record comes from it, so the detail view renders instantly on click.
const DetailsPage = () => <InvoiceSplitView />;

export default DetailsPage;
