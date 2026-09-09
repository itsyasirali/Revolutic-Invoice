import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { getAuthUserId } from "@/lib/session";

const deleteInvoice = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const parsedUserId = userId;
    const invoiceId = Number(id);

    const db = await getDatabase();
    const invoiceRepository = db.getRepository(Invoice);

    const result = await invoiceRepository.delete({
      id: invoiceId,
      userId: parsedUserId,
    });

    if (result.affected === 0) {
      return NextResponse.json(
        { message: "Invoice not found or access denied" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { message: "Failed to delete invoice" },
      { status: 500 },
    );
  }
};

export default deleteInvoice;
