import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { getAuthUserId } from "@/lib/session";

const getInvoice = async (
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

    if (isNaN(invoiceId)) {
      return NextResponse.json(
        { message: "Invalid invoice ID" },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const invoiceRepository = db.getRepository(Invoice);

    const invoice = await invoiceRepository.findOne({
      where: { id: invoiceId, userId: parsedUserId },
      relations: ["customer", "template", "items", "items.item"],
    });

    if (!invoice) {
      return NextResponse.json(
        { message: "Invoice not found or access denied" },
        { status: 404 },
      );
    }

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { message: "Failed to fetch invoice", error: error?.message || String(error) },
      { status: 500 },
    );
  }
};

export default getInvoice;
