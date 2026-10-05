import InvoicePreview from "@/components/Invoices/InvoicePreview";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Invoice Preview", "Preview this invoice on your template, then download it as a PDF or send it.");


export default function InvoicePreviewPage() {
  return <InvoicePreview />;
}
