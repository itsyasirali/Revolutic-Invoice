import PaymentSplitView from "@/components/Payments/PaymentSplitView";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Payment Details", "Payment overview with the invoices it was applied to, bank charges and activity.");

// No server-side data fetch here: the list is already in the client cache and the
// opened record comes from it, so the detail view renders instantly on click.
const DetailsPage = () => <PaymentSplitView />;

export default DetailsPage;
