import { NextRequest, NextResponse } from "next/server";
import { FindOptionsWhere } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Payment } from "@/entities/Payment";
import { getToken } from "next-auth/jwt";

const getAllPayments = async (req: NextRequest) => {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const data = { user: token };
  const userId = data.user?.id;

  try {
    const parsedUserId = parseInt(String(userId));
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const customerIdParam = req.nextUrl.searchParams.get("customerId");
    const customerId = customerIdParam ? Number(customerIdParam) : undefined;

    const db = await getDatabase();
    const paymentRepository = db.getRepository(Payment);

    const where: FindOptionsWhere<Payment> = { userId: parsedUserId };

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const queryBuilder = paymentRepository
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.customer", "customer")
      .leftJoinAndSelect("payment.template", "template")
      .leftJoinAndSelect("payment.appliedInvoices", "appliedInvoices")
      .leftJoinAndSelect("appliedInvoices.invoice", "invoice")
      .where(where)
      .orderBy("payment.paymentDate", "DESC");

    const payments = await queryBuilder.getMany();

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { message: "Failed to fetch payments" },
      { status: 500 }
    );
  }
};

export default getAllPayments;
