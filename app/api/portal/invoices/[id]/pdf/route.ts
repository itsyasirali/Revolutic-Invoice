import { NextRequest } from "next/server";
import { portalInvoicePdf } from "@/controllers/portal/portalData";

type Ctx = { params: Promise<{ id: string }> };

export const GET = async (req: NextRequest, ctx: Ctx) => portalInvoicePdf(req, ctx);
