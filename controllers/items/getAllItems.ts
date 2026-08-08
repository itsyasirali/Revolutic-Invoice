import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Item } from "@/entities/Item";
import { readSession } from "@/lib/session";

const getAllItems = async (req: NextRequest) => {
  const { data } = await readSession(req);
  const userId = data.user?.id;

  try {
    const parsedUserId = parseInt(String(userId));

    const db = await getDatabase();
    const itemsRepository = db.getRepository(Item);

    const items = await itemsRepository.find({
      where: { userId: parsedUserId },
      order: { createdAt: "DESC" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { message: "Failed to fetch items" },
      { status: 500 },
    );
  }
};

export default getAllItems;
