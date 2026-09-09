import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Item } from "@/entities/Item";
import { InvoiceItem } from "@/entities/InvoiceItem";
import { getAuthUserId } from "@/lib/session";
import { BatchDeleteItemPayload } from "@/types/item";

const batchDeleteItems = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: BatchDeleteItemPayload = await req.json();
    const { items: itemIds } = body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { message: "No items provided" },
        { status: 400 },
      );
    }

    const parsedUserId = userId;
    const parsedItemIds = itemIds
      .map((id) => parseInt(String(id)))
      .filter((id) => !isNaN(id));

    if (parsedItemIds.length === 0) {
      return NextResponse.json(
        { message: "No valid item IDs provided" },
        { status: 400 },
      );
    }

    const db = await getDatabase();

    // Safely unlink any existing invoice line items so invoices retain their text snapshot
    // without failing Postgres foreign key constraint
    const invoiceItemRepo = db.getRepository(InvoiceItem);
    await invoiceItemRepo.update(
      { itemId: In(parsedItemIds) },
      { itemId: null },
    );

    const itemsRepository = db.getRepository(Item);
    const result = await itemsRepository.delete({
      id: In(parsedItemIds),
      userId: parsedUserId,
    });

    return NextResponse.json({
      message: "Items deleted successfully",
      deleted: result.affected,
    });
  } catch (error: any) {
    console.error("Error batch deleting items:", error);
    const message = error?.detail || error?.message || "Failed to delete items";
    return NextResponse.json(
      { message, error: String(error) },
      { status: 500 },
    );
  }
};

export default batchDeleteItems;
