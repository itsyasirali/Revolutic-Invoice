import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Payment } from "@/entities/Payment";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";

const getPayment = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const orgId = await getAuthOrgId(req);
  const { id } = await params;

  try {
    const parsedUserId = userId;
    const paymentId = parseInt(id);

    if (isNaN(paymentId)) {
      return NextResponse.json(
        { message: "Invalid payment ID" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const paymentRepository = db.getRepository(Payment);

    const qb = paymentRepository
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.customer", "customer")
      .leftJoinAndSelect("payment.template", "template")
      .leftJoinAndSelect("payment.appliedInvoices", "appliedInvoices")
      .leftJoinAndSelect("appliedInvoices.invoice", "invoice");

    if (orgId) {
      qb.where("payment.id = :id AND payment.organizationId = :orgId", {
        id: paymentId,
        orgId,
      });
    } else {
      qb.where("payment.id = :id AND payment.userId = :userId", {
        id: paymentId,
        userId: parsedUserId,
      });
    }

    const payment = await qb.getOne();

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
