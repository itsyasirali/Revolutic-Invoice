import { NextRequest } from "next/server";
import { portalQuote } from "@/controllers/portal/portalData";

type Ctx = { params: Promise<{ id: string }> };

export const GET = async (req: NextRequest, ctx: Ctx) => portalQuote(req, ctx);
