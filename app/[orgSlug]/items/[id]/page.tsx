import ItemSplitView from "@/components/Items/ItemSplitView";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Item Details", "Item overview with sales information and the invoices and quotes that use it.");

// No server-side data fetch here: the list is already in the client cache and the
// opened record comes from it, so the detail view renders instantly on click.
const DetailsPage = () => <ItemSplitView />;

export default DetailsPage;
