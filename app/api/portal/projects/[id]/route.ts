import { NextRequest } from "next/server";
import { portalProject } from "@/controllers/portal/portalData";

type Ctx = { params: Promise<{ id: string }> };

export const GET = async (req: NextRequest, ctx: Ctx) => portalProject(req, ctx);
