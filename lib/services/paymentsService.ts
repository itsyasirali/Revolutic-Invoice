import { getDatabase } from "@/lib/database";
import { Payment } from "@/entities/Payment";
import type { Payment as PaymentType } from "@/types/payment";

const fetchPaymentsForUser = async (
  userId: number,
): Promise<PaymentType[]> => {
  try {
    const db = await getDatabase();
    const paymentRepository = db.getRepository(Payment);

    const queryBuilder = paymentRepository
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.customer", "customer")
      .leftJoinAndSelect("payment.template", "template")
      .leftJoinAndSelect("payment.appliedInvoices", "appliedInvoices")
      .leftJoinAndSelect("appliedInvoices.invoice", "invoice")
      .where("payment.userId = :userId", { userId })
      .orderBy("payment.paymentDate", "DESC");

    const payments = await queryBuilder.getMany();

    return JSON.parse(JSON.stringify(payments));
  } catch (error) {
    console.error("Error fetching payments on server:", error);
    return [];
  }
};

export default fetchPaymentsForUser;
