import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Payment } from "@/entities/Payment";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";

const updatePayment = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const paymentId = parseInt(id);

    if (isNaN(paymentId)) {
      return NextResponse.json(
        { message: "Invalid payment ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const orgId = await getAuthOrgId(req);
    if (!orgId) {
      return NextResponse.json(
        { message: "Active organization is required" },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const paymentRepo = db.getRepository(Payment);

    const payment = await paymentRepo.findOne({
      where: { id: paymentId, organizationId: orgId },
      relations: ["appliedInvoices"],
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
      const newAmount = Number(body.amountReceived);
      if (!Number.isFinite(newAmount) || newAmount < 0) {
        return NextResponse.json(
          { message: "Amount received must be a valid non-negative number" },
          { status: 400 }
        );
      }
      const totalApplied = (payment.appliedInvoices || []).reduce(
        (sum, a) => sum + Number(a.amount || 0),
        0,
      );
      if (
        totalApplied > 0 &&
        Number((newAmount - totalApplied).toFixed(2)) !== 0
      ) {
        return NextResponse.json(
          {
            message: `Amount received must equal the total applied to invoices (${totalApplied.toFixed(2)})`,
          },
          { status: 400 }
        );
      }
      payment.amountReceived = newAmount;
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
