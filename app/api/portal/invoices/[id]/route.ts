import { NextRequest } from "next/server";
import { portalInvoice } from "@/controllers/portal/portalData";

type Ctx = { params: Promise<{ id: string }> };

export const GET = async (req: NextRequest, ctx: Ctx) => portalInvoice(req, ctx);
