import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Item } from "@/entities/Item";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";
import { BatchUpdateItemPayload } from "@/types/item";

const batchUpdateItems = async (req: NextRequest) => {
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

    const parsedItemIds = itemIds.map((id) => parseInt(id));

    const db = await getDatabase();
    const itemsRepository = db.getRepository(Item);

    const updateFilter = { id: In(parsedItemIds), organizationId: orgId };

    const result = await itemsRepository.update(updateFilter, { status });

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
