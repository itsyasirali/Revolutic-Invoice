import { NextRequest } from "next/server";
import { portalInvoices } from "@/controllers/portal/portalData";

export const GET = async (req: NextRequest) => portalInvoices(req);
