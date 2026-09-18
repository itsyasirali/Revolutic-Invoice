import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { PaymentAppliedInvoice } from "@/entities/PaymentAppliedInvoice";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";

const deleteInvoice = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    const invoiceId = Number(id);

    if (isNaN(invoiceId)) {
      return NextResponse.json(
        { message: "Invalid invoice ID" },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const invoiceRepository = db.getRepository(Invoice);

    const existingInvoice = await invoiceRepository.findOne({
      where: { id: invoiceId, organizationId: orgId },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { message: "Invoice not found or access denied" },
        { status: 404 },
      );
    }

    const paymentAppliedRepo = db.getRepository(PaymentAppliedInvoice);
    const linkedPaymentCount = await paymentAppliedRepo.count({
      where: { invoiceId },
    });

    if (linkedPaymentCount > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete invoice: ${linkedPaymentCount} payment(s) are linked to this invoice. Please delete the associated payments first.`,
        },
        { status: 400 },
      );
    }

    await invoiceRepository.delete({ id: invoiceId, organizationId: orgId });

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting invoice:", error);
    const message = error?.detail || error?.message || "Failed to delete invoice";
    return NextResponse.json(
      { message, error: String(error) },
      { status: 500 },
    );
  }
};

export default deleteInvoice;
