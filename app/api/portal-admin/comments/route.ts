import { NextRequest } from "next/server";
import { listBusinessComments, replyToComment } from "@/controllers/portal/portalAdmin";

export const GET = async (req: NextRequest) => listBusinessComments(req);

export const POST = async (req: NextRequest) => replyToComment(req);
