import { NextRequest } from "next/server";
import { portalChangePassword } from "@/controllers/portal/portalAuth";

export const POST = async (req: NextRequest) => portalChangePassword(req);
