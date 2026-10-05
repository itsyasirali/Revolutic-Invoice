import QuoteEmailCompose from "@/components/Quotes/QuoteEmailCompose";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Email Quote", "Compose and send this quote to your customer by email.");


const QuoteEmailPage = () => <QuoteEmailCompose />;

export default QuoteEmailPage;
