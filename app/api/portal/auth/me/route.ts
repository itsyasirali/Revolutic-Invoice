import { NextRequest } from "next/server";
import { portalMe } from "@/controllers/portal/portalAuth";

export const GET = async (req: NextRequest) => portalMe(req);
