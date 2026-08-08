import { NextRequest } from "next/server";
import getAllItems from "@/controllers/items/getAllItems";
import createItem from "@/controllers/items/createItem";

export const GET = async (req: NextRequest) => {
  return getAllItems(req);
};

export const POST = async (req: NextRequest) => {
  return createItem(req);
};
