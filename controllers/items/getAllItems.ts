import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Item } from "@/entities/Item";
import { getAuthUserId } from "@/lib/session";

const getAllItems = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsedUserId = userId;

    const db = await getDatabase();
    const itemsRepository = db.getRepository(Item);

    const items = await itemsRepository.find({
      where: { userId: parsedUserId },
      order: { createdAt: "DESC" },
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { message: "Failed to fetch items", error: error?.message || String(error) },
      { status: 500 },
    );
  }
};

export default getAllItems;
