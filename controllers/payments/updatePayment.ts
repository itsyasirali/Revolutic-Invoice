import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Payment } from "@/entities/Payment";
import { getToken } from "next-auth/jwt";

const updatePayment = async (
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

    const body = await req.json();

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

    if (body.templateId !== undefined) {
      payment.templateId = Number(body.templateId);
    }
    if (body.status !== undefined) {
      payment.status = body.status;
    }
    if (body.paymentMode !== undefined) {
      payment.paymentMode = body.paymentMode;
    }
    if (body.referenceNo !== undefined) {
      payment.referenceNo = body.referenceNo;
    }
    if (body.amountReceived !== undefined) {
      payment.amountReceived = Number(body.amountReceived);
    }
    if (body.notes !== undefined) {
      payment.notes = body.notes;
    }

    await paymentRepo.save(payment);

    const updatedPayment = await paymentRepo.findOne({
      where: { id: paymentId },
      relations: ["customer", "template", "appliedInvoices", "appliedInvoices.invoice"],
    });

    return NextResponse.json({ payment: updatedPayment });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { message: "Failed to update payment" },
      { status: 500 }
    );
  }
};

export default updatePayment;
