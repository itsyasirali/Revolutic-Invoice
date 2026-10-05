import QuotePreview from "@/components/Quotes/QuotePreview";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Quote Preview", "Preview this quote on your template, then download it as a PDF or send it.");


const QuotePreviewPage = () => <QuotePreview />;

export default QuotePreviewPage;
