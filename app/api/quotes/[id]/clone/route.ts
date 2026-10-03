import { NextRequest } from "next/server";
import { cloneQuote } from "@/controllers/quotes/quoteActions";

export const POST = async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
  cloneQuote(req, ctx);
