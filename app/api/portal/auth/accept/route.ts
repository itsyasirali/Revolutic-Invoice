import { NextRequest } from "next/server";
import { portalAcceptInvite } from "@/controllers/portal/portalAuth";

export const POST = async (req: NextRequest) => portalAcceptInvite(req);
