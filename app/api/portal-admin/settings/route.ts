import { NextRequest } from "next/server";
import { getPortalSettings, updatePortalSettings } from "@/controllers/portal/portalAdmin";

export const GET = async (req: NextRequest) => getPortalSettings(req);

export const PUT = async (req: NextRequest) => updatePortalSettings(req);
