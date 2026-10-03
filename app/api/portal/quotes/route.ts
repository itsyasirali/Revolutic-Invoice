import { NextRequest } from "next/server";
import { portalQuotes } from "@/controllers/portal/portalData";

export const GET = async (req: NextRequest) => portalQuotes(req);
