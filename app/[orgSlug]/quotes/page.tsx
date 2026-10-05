import QuoteList from "@/components/Quotes/QuoteList";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Quotes", "Create and send quotes, track which are accepted or declined, and convert them into invoices.");


const QuotesPage = () => <QuoteList />;

export default QuotesPage;
