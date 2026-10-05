import InvoiceSplitView from "@/components/Invoices/InvoiceSplitView";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Invoice Preview", "Preview this invoice on your template, then download it as a PDF or send it.");

// Same layout as the details: the invoice list on the left, the preview on the right.
export default function InvoicePreviewPage() {
  return <InvoiceSplitView preview />;
}
