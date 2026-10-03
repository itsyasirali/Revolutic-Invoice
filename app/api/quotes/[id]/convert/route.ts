import { NextRequest } from "next/server";
import { convertQuote } from "@/controllers/quotes/quoteActions";

export const POST = async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
  convertQuote(req, ctx);
