import { getDatabase } from "@/lib/database";
import { Payment } from "@/entities/Payment";
import type { Payment as PaymentType } from "@/types/payment";

const fetchPaymentsForUser = async (
  userId: number,
  orgId?: number | null,
): Promise<PaymentType[]> => {
  try {
    const db = await getDatabase();
    const paymentRepository = db.getRepository(Payment);

    const queryBuilder = paymentRepository
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.customer", "customer")
      .leftJoinAndSelect("payment.template", "template")
      .leftJoinAndSelect("payment.appliedInvoices", "appliedInvoices")
      .leftJoinAndSelect("appliedInvoices.invoice", "invoice");

    if (orgId) {
      queryBuilder.where("payment.organizationId = :orgId", { orgId });
    } else {
      queryBuilder.where("payment.userId = :userId", { userId });
    }

    const payments = await queryBuilder
      .orderBy("payment.paymentDate", "DESC")
      .getMany();

    return JSON.parse(JSON.stringify(payments));
  } catch (error) {
    console.error("Error fetching payments on server:", error);
    return [];
  }
};

export default fetchPaymentsForUser;
