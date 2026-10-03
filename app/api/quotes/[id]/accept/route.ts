import { NextRequest } from "next/server";
import { acceptQuote } from "@/controllers/quotes/quoteActions";

export const POST = async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
  acceptQuote(req, ctx);
