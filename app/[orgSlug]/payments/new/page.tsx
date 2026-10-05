import PaymentForm from "@/components/Payments/PaymentForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Record Payment", "Record a payment from a customer and apply it to their open invoices.");


export default function NewPaymentPage() {
  return <PaymentForm />;
}
