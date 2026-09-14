import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Payment } from "@/entities/Payment";
import { PaymentAppliedInvoice } from "@/entities/PaymentAppliedInvoice";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";

const deletePayment = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const orgId = await getAuthOrgId(req);
  if (!orgId) {
    return NextResponse.json(
      { message: "Active organization is required" },
      { status: 400 },
    );
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

    const db = await getDatabase();
    const paymentRepo = db.getRepository(Payment);

    const existingPayment = await paymentRepo.findOne({
      where: { id: paymentId, organizationId: orgId },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { message: "Payment not found or access denied" },
        { status: 404 }
      );
    }

    // Delete applied invoice records first to ensure no constraint issues
    const paymentAppliedRepo = db.getRepository(PaymentAppliedInvoice);
    await paymentAppliedRepo.delete({ paymentId });

    await paymentRepo.delete({ id: paymentId, organizationId: orgId });

    return NextResponse.json({ message: "Payment deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting payment:", error);
    const message = error?.detail || error?.message || "Failed to delete payment";
    return NextResponse.json(
      { message, error: String(error) },
      { status: 500 }
    );
  }
};

export default deletePayment;
