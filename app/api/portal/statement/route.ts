import { NextRequest } from "next/server";
import { portalStatement } from "@/controllers/portal/portalData";

export const GET = async (req: NextRequest) => portalStatement(req);
