import { NextRequest } from "next/server";
import { portalDashboard } from "@/controllers/portal/portalData";

export const GET = async (req: NextRequest) => portalDashboard(req);
