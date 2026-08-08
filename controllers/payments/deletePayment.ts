import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Payment } from "@/entities/Payment";
import { getToken } from "next-auth/jwt";

const deletePayment = async (
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
    const paymentRepo = db.getRepository(Payment);

    const payment = await paymentRepo.findOne({
      where: { id: paymentId, userId: parsedUserId },
    });

    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }

    await paymentRepo.remove(payment);

    return NextResponse.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { message: "Failed to delete payment" },
      { status: 500 }
    );
  }
};

export default deletePayment;
