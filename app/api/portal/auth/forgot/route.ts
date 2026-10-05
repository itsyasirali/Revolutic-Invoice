import { NextRequest } from "next/server";
import { portalForgotPassword } from "@/controllers/portal/portalAuth";

export const POST = async (req: NextRequest) => portalForgotPassword(req);
