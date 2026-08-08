import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Item } from "@/entities/Item";
import { readSession } from "@/lib/session";
import { UpdateItemPayload } from "@/types/item";

const updateItem = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { data } = await readSession(req);
  const userId = data.user?.id;
  const { id } = await params;

  try {
    const parsedId = parseInt(id);
    const parsedUserId = parseInt(String(userId));

    const db = await getDatabase();
    const itemsRepository = db.getRepository(Item);

    // Unlike customers' update (which never filters by userId), the
    // original ItemsUpdateService scopes the lookup by userId too — an
    // ownership check preserved here.
    const existingItem = await itemsRepository.findOne({
      where: { id: parsedId, userId: parsedUserId },
    });
    if (!existingItem) {
      return NextResponse.json(
        { message: "Item not found" },
        { status: 404 },
      );
    }

    const body: UpdateItemPayload = await req.json();

    // Matches the original service's plain Object.assign merge (no field
    // is individually required/guarded on update).
    Object.assign(existingItem, body);

    await itemsRepository.save(existingItem);

    return NextResponse.json({
      message: "Item updated successfully",
      item: existingItem,
    });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { message: "Failed to update item" },
      { status: 500 },
    );
  }
};

export default updateItem;
