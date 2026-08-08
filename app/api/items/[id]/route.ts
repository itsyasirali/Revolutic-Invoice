import { NextRequest } from "next/server";
import updateItem from "@/controllers/items/updateItem";
import deleteItem from "@/controllers/items/deleteItem";

export const PUT = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
  return updateItem(req, ctx);
};

export const DELETE = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
  return deleteItem(req, ctx);
};
