import { NextRequest } from "next/server";
import { portalAddComment, portalComments } from "@/controllers/portal/portalData";

export const GET = async (req: NextRequest) => portalComments(req);

export const POST = async (req: NextRequest) => portalAddComment(req);
