import { NextRequest } from "next/server";
import { portalUpdateProfile } from "@/controllers/portal/portalData";

export const PUT = async (req: NextRequest) => portalUpdateProfile(req);
