import { NextRequest } from "next/server";
import { portalPendingTime, portalReviewTime } from "@/controllers/portal/portalData";

export const GET = async (req: NextRequest) => portalPendingTime(req);

export const POST = async (req: NextRequest) => portalReviewTime(req);
