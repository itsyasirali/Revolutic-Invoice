import PaymentList from "@/components/Payments/PaymentList";
import fetchPaymentsForUser from "@/lib/services/paymentsService";
import { getServerSessionUser } from "@/lib/session";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Payments", "Record payments received and apply them to your customers' invoices.");


const PaymentsPage = async () => {
  const user = await getServerSessionUser();
  const orgId = user?.organizationId ? Number(user.organizationId) : null;
  const payments = user?.id ? await fetchPaymentsForUser(Number(user.id), orgId) : [];

  return <PaymentList initialPayments={payments} />;
};

export default PaymentsPage;
