import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Template } from "@/entities/Template";
import { Payment } from "@/entities/Payment";
import { Invoice } from "@/entities/Invoice";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";

const deleteTemplate = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const organizationId = await getAuthOrgId(req);
    if (!organizationId) {
      return NextResponse.json(
        { message: "Active organization is required" },
        { status: 400 }
      );
    }
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return NextResponse.json(
        { message: "Invalid template ID" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const invoiceRepo = db.getRepository(Invoice);
    const paymentRepo = db.getRepository(Payment);

    const [linkedInvoiceCount, linkedPaymentCount] = await Promise.all([
      invoiceRepo.count({ where: { templateId, organizationId } }),
      paymentRepo.count({ where: { templateId, organizationId } }),
    ]);

    if (linkedInvoiceCount > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete template: ${linkedInvoiceCount} invoice(s) are using this template. Please delete or reassign those invoices first.`,
        },
        { status: 400 },
      );
    }

    if (linkedPaymentCount > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete template: ${linkedPaymentCount} payment(s) are using this template. Please delete or reassign those payments first.`,
        },
        { status: 400 },
      );
    }

    const templateRepo = db.getRepository(Template);
    const deleteWhere = { id: templateId, organizationId };
    const result = await templateRepo.delete(deleteWhere);

    if (result.affected === 0) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting template:", error);
    const message = error?.detail || error?.message || "Failed to delete template";
    return NextResponse.json(
      { message, error: String(error) },
      { status: 500 }
    );
  }
};

export default deleteTemplate;
