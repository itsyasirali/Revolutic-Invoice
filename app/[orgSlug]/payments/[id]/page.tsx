import PaymentSplitView from "@/components/Payments/PaymentSplitView";
import fetchPaymentsForUser from "@/lib/services/paymentsService";
import { getServerSessionUser } from "@/lib/session";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Payment Details", "Payment overview with the invoices it was applied to, bank charges and activity.");


export default async function PaymentDetailsPage() {
  const user = await getServerSessionUser();
  const orgId = user?.organizationId ? Number(user.organizationId) : null;
  const payments = user?.id ? await fetchPaymentsForUser(Number(user.id), orgId) : [];

  return <PaymentSplitView initialPayments={payments} />;
}
