import { NextRequest } from "next/server";
import { markQuoteViewed } from "@/controllers/quotes/quoteActions";

export const POST = async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
  markQuoteViewed(req, ctx);
