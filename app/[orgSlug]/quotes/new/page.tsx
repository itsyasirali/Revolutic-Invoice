import QuoteForm from "@/components/Quotes/QuoteForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("New Quote", "Create a quote with line items, discount, expiry date and terms.");


const NewQuotePage = () => <QuoteForm />;

export default NewQuotePage;
