import { NextRequest, NextResponse } from "next/server";
import { getRequestContext, errorResponse } from "@/lib/requestContext";
import { getReportsData, parseReportRange, REPORT_RANGES } from "@/lib/services/reportsService";

/** GET /api/reports?range=this-month — same data the web Reports page renders. */
export const GET = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const range = parseReportRange(req.nextUrl.searchParams.get("range"));
    const data = await getReportsData(ctx.orgId, range);
    return NextResponse.json({ data, ranges: REPORT_RANGES });
  } catch (error) {
    return errorResponse(error, "Failed to load reports");
  }
};
