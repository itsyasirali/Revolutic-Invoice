import { getDatabase } from "@/lib/database";
import { Item as ItemEntity } from "@/entities/Item";
import type { Item } from "@/types/item";

const fetchItemsForUser = async (userId: number): Promise<Item[]> => {
  try {
    const db = await getDatabase();
    const itemsRepository = db.getRepository(ItemEntity);

    const items = await itemsRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });

    return JSON.parse(JSON.stringify(items));
  } catch (error) {
    console.error("Error fetching items on server:", error);
    return [];
  }
};

export default fetchItemsForUser;
