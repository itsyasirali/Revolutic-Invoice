import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Item } from "@/entities/Item";
import { readSession } from "@/lib/session";
import { BatchDeleteItemPayload } from "@/types/item";

const batchDeleteItems = async (req: NextRequest) => {
  const { data } = await readSession(req);
  const userId = data.user?.id;

  try {
    const body: BatchDeleteItemPayload = await req.json();
    const { items: itemIds } = body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { message: "No items provided" },
        { status: 400 },
      );
    }

    const parsedUserId = parseInt(String(userId));
    const parsedItemIds = itemIds.map((id) => parseInt(id));

    const db = await getDatabase();
    const itemsRepository = db.getRepository(Item);

    const result = await itemsRepository.delete({
      id: In(parsedItemIds),
      userId: parsedUserId,
    });

    return NextResponse.json({
      message: "Items deleted",
      deleted: result.affected,
    });
  } catch (error) {
    console.error("Error batch deleting items:", error);
    return NextResponse.json(
      { message: "Failed to delete items" },
      { status: 500 },
    );
  }
};

export default batchDeleteItems;
