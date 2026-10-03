import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { getRequestContext, errorResponse } from "@/lib/requestContext";
import { timeEntryQuery, loadTimeEntry } from "./timePayload";

export const getAllTimeEntries = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const db = await getDatabase();
    const timeEntries = await timeEntryQuery(db, ctx.orgId)
      .orderBy("t.date", "DESC")
      .addOrderBy("t.id", "DESC")
      .getMany();
    return NextResponse.json({ timeEntries });
  } catch (error) {
    return errorResponse(error, "Failed to fetch time entries");
  }
};

export const getTimeEntry = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  try {
    const db = await getDatabase();
    const timeEntry = await loadTimeEntry(db, parseInt(id), ctx.orgId);
    if (!timeEntry) {
      return NextResponse.json({ message: "Time entry not found" }, { status: 404 });
    }
    return NextResponse.json({ timeEntry });
  } catch (error) {
    return errorResponse(error, "Failed to fetch time entry");
  }
};
