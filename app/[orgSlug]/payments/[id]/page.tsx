import PaymentSplitView from "@/components/Payments/PaymentSplitView";
import fetchPaymentsForUser from "@/lib/services/paymentsService";
import { getServerSessionUser } from "@/lib/session";

export default async function PaymentDetailsPage() {
  const user = await getServerSessionUser();
  const orgId = user?.organizationId ? Number(user.organizationId) : null;
  const payments = user?.id ? await fetchPaymentsForUser(Number(user.id), orgId) : [];

  return <PaymentSplitView initialPayments={payments} />;
}
