import QuoteSplitView from "@/components/Quotes/QuoteSplitView";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Quote Details", "Quote overview with line items, totals, customer comments and activity.");


const DetailsPage = () => <QuoteSplitView />;

export default DetailsPage;
