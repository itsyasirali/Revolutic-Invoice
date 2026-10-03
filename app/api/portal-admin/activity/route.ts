import { NextRequest } from "next/server";
import { getPortalActivity, markPortalActivityRead } from "@/controllers/portal/portalAdmin";

export const GET = async (req: NextRequest) => getPortalActivity(req);

export const POST = async (req: NextRequest) => markPortalActivityRead(req);
