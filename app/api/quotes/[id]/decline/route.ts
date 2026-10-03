import { NextRequest } from "next/server";
import { declineQuote } from "@/controllers/quotes/quoteActions";

export const POST = async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
  declineQuote(req, ctx);
