import PaymentSplitView from "@/components/Payments/PaymentSplitView";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Payment Receipt Preview", "Preview this payment receipt on your template, then download it as a PDF or send it.");

// Same layout as the details: the payment list on the left, the receipt on the right.
export default function PaymentPreviewPage() {
  return <PaymentSplitView preview />;
}
