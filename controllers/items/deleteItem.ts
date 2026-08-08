import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Item } from "@/entities/Item";
import { readSession } from "@/lib/session";

const deleteItem = async (
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
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { message: "Failed to delete item" },
      { status: 500 },
    );
  }
};

export default deleteItem;
