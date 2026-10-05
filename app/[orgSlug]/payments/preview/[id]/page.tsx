import PaymentPreview from "@/components/Payments/PaymentPreview";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Payment Receipt Preview", "Preview this payment receipt on your template, then download it as a PDF or send it.");


export default function PaymentPreviewPage() {
  return <PaymentPreview />;
}
