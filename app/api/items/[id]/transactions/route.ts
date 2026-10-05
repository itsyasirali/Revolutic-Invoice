import { NextRequest } from "next/server";
import getItemTransactions from "@/controllers/items/getItemTransactions";

export const GET = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
  return getItemTransactions(req, ctx);
};
