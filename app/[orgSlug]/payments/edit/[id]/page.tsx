import PaymentForm from "@/components/Payments/PaymentForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Edit Payment", "Update this payment's amount, date, mode and the invoices it is applied to.");


export default function EditPaymentPage() {
  return <PaymentForm />;
}
