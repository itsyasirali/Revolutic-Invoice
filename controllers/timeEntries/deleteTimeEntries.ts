import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { TimeEntry } from "@/entities/TimeEntry";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";
import { parseIds } from "@/lib/services/billingService";

/** Shared by DELETE /time-tracking/[id] and DELETE /time-tracking/batch-delete. */
const deleteTimeEntriesByIds = async (orgId: number, ids: number[]) => {
  const db = await getDatabase();
  const repo = db.getRepository(TimeEntry);
  const invoicedCount = await repo.count({
    where: { id: In(ids), organizationId: orgId, invoiced: true },
  });
  if (invoicedCount > 0) {
    throw new HttpError(
      "Invoiced time entries cannot be deleted. Delete the invoice first.",
      409,
    );
  }
  const result = await repo.delete({ id: In(ids), organizationId: orgId });
  return result.affected ?? 0;
};

export const deleteTimeEntry = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  try {
    const affected = await deleteTimeEntriesByIds(ctx.orgId, [parseInt(id)]);
    if (!affected) {
      return NextResponse.json({ message: "Time entry not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Time entry deleted successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to delete time entry");
  }
};

export const batchDeleteTimeEntries = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const { timeEntries } = (await req.json()) as { timeEntries?: unknown };
    const ids = parseIds(timeEntries);
    if (ids.length === 0) throw new HttpError("No time entries provided", 400);
    const deleted = await deleteTimeEntriesByIds(ctx.orgId, ids);
    return NextResponse.json({ message: "Time entries deleted successfully", deleted });
  } catch (error) {
    return errorResponse(error, "Failed to delete time entries");
  }
};
