import { NextRequest } from "next/server";
import { portalDeclineQuote } from "@/controllers/portal/portalData";

type Ctx = { params: Promise<{ id: string }> };

export const POST = async (req: NextRequest, ctx: Ctx) => portalDeclineQuote(req, ctx);
