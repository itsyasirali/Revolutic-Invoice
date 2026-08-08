import { NextRequest } from "next/server";
import batchUpdateItems from "@/controllers/items/batchUpdateItems";

export const PUT = async (req: NextRequest) => {
  return batchUpdateItems(req);
};
