import { NextRequest } from "next/server";
import sendQuote from "@/controllers/quotes/sendQuote";

export const POST = async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
  sendQuote(req, ctx);
