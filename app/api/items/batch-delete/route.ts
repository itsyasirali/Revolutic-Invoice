import { NextRequest } from "next/server";
import batchDeleteItems from "@/controllers/items/batchDeleteItems";

export const DELETE = async (req: NextRequest) => {
  return batchDeleteItems(req);
};
