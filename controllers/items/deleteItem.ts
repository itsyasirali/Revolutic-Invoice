import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Item } from "@/entities/Item";
import { InvoiceItem } from "@/entities/InvoiceItem";
import { getAuthUserId } from "@/lib/session";

const deleteItem = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { message: "Invalid item ID" },
        { status: 400 },
      );
    }
    const parsedUserId = userId;

    const db = await getDatabase();

    // Safely unlink any existing invoice line items so invoices retain their text snapshot
    // without failing Postgres foreign key constraint
    const invoiceItemRepo = db.getRepository(InvoiceItem);
    await invoiceItemRepo.update(
      { itemId: parsedId },
      { itemId: null },
    );

    const itemsRepository = db.getRepository(Item);
    const result = await itemsRepository.delete({
      id: parsedId,
      userId: parsedUserId,
    });

    if (result.affected === 0) {
      return NextResponse.json(
        { message: "Item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting item:", error);
    const message = error?.detail || error?.message || "Failed to delete item";
    return NextResponse.json(
      { message, error: String(error) },
      { status: 500 },
    );
  }
};

export default deleteItem;
