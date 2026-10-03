import { NextRequest } from "next/server";
import { portalProjects } from "@/controllers/portal/portalData";

export const GET = async (req: NextRequest) => portalProjects(req);
