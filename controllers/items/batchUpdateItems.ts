import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Item } from "@/entities/Item";
import { getToken } from "next-auth/jwt";
import { BatchUpdateItemPayload } from "@/types/item";

const batchUpdateItems = async (req: NextRequest) => {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const data = { user: token };
  const userId = data.user?.id;

  try {
    const body: BatchUpdateItemPayload = await req.json();
    const { status, items: itemIds } = body;

    if (!status || (status !== "Active" && status !== "inActive")) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400 },
      );
    }
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

    const result = await itemsRepository.update(
      { id: In(parsedItemIds), userId: parsedUserId },
      { status },
    );

    return NextResponse.json({
      message: "Status updated",
      modified: result.affected,
    });
  } catch (error) {
    console.error("Error batch updating items:", error);
    return NextResponse.json(
      { message: "Failed to update items" },
      { status: 500 },
    );
  }
};

export default batchUpdateItems;
