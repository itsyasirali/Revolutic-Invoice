import { NextRequest } from "next/server";
import { portalLogin } from "@/controllers/portal/portalAuth";

export const POST = async (req: NextRequest) => portalLogin(req);
