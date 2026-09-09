import PaymentList from "@/components/Payments/PaymentList";
import fetchPaymentsForUser from "@/lib/services/paymentsService";
import { getServerSessionUser } from "@/lib/session";

const PaymentsPage = async () => {
  const user = await getServerSessionUser();
  const payments = user?.id ? await fetchPaymentsForUser(Number(user.id)) : [];

  return <PaymentList initialPayments={payments} />;
};

export default PaymentsPage;
