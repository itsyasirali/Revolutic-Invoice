import { NextRequest } from "next/server";
import { portalInviteInfo } from "@/controllers/portal/portalAuth";

export const GET = async (req: NextRequest) => portalInviteInfo(req);
