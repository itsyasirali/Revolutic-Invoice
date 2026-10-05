import QuoteForm from "@/components/Quotes/QuoteForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Edit Quote", "Update this quote's customer, line items, expiry date and terms.");


const EditQuotePage = () => <QuoteForm />;

export default EditQuotePage;
