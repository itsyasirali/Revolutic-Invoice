import { NextRequest } from "next/server";
import { portalAcceptQuote } from "@/controllers/portal/portalData";

type Ctx = { params: Promise<{ id: string }> };

export const POST = async (req: NextRequest, ctx: Ctx) => portalAcceptQuote(req, ctx);
