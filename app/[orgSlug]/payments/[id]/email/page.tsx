import PaymentEmailCompose from "@/components/Payments/PaymentEmailCompose";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Email Payment Receipt", "Compose and send this payment receipt to your customer by email.");


export default function PaymentEmailPage() {
  return <PaymentEmailCompose />;
}
