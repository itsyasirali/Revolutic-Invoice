import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Item } from "@/entities/Item";
import { getAuthUserId } from "@/lib/session";
import { UpdateItemPayload } from "@/types/item";

const updateItem = async (
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
    const parsedUserId = userId;

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

    if (body.name !== undefined) existingItem.name = String(body.name).trim();
    if (body.unit !== undefined) existingItem.unit = body.unit ? String(body.unit).trim() : null as unknown as string;
    if (body.sellingPrice !== undefined) existingItem.sellingPrice = Number(body.sellingPrice);
    if (body.description !== undefined) existingItem.description = body.description ? String(body.description).trim() : null as unknown as string;
    if (body.status !== undefined) existingItem.status = body.status;

    await itemsRepository.save(existingItem);

    return NextResponse.json({
      message: "Item updated successfully",
      item: existingItem,
    });
  } catch (error) {
    console.error("Error updating item:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update item";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 },
    );
  }
};

export default updateItem;
