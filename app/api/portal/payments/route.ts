import { NextRequest } from "next/server";
import { portalPayments } from "@/controllers/portal/portalData";

export const GET = async (req: NextRequest) => portalPayments(req);
