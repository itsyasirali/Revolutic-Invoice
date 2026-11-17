import { NextRequest, NextResponse } from "next/server";
import { getRequestContext, errorResponse } from "@/lib/requestContext";
import getDashboardData from "@/lib/services/dashboardService";

/** GET /api/dashboard: the same data the web dashboard renders (charts, KPIs, insights). */
export const GET = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const data = await getDashboardData(ctx.userId, ctx.orgId);
    return NextResponse.json({ data });
  } catch (error) {
    return errorResponse(error, "Failed to load dashboard");
  }
};
