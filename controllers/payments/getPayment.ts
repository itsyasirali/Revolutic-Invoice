import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Payment } from "@/entities/Payment";
import { getToken } from "next-auth/jwt";

const getPayment = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const data = { user: token };
  const userId = data.user?.id;
  const { id } = await params;

  try {
    const parsedUserId = parseInt(String(userId));
    const paymentId = parseInt(id);

    if (isNaN(paymentId)) {
      return NextResponse.json(
        { message: "Invalid payment ID" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const paymentRepository = db.getRepository(Payment);

    const payment = await paymentRepository
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.customer", "customer")
      .leftJoinAndSelect("payment.template", "template")
      .leftJoinAndSelect("payment.appliedInvoices", "appliedInvoices")
      .leftJoinAndSelect("appliedInvoices.invoice", "invoice")
      .where("payment.id = :id AND payment.userId = :userId", {
        id: paymentId,
        userId: parsedUserId,
      })
      .getOne();

    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { message: "Failed to fetch payment" },
      { status: 500 }
    );
  }
};

export default getPayment;
