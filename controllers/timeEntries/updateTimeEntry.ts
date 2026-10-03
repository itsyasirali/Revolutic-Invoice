import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { TimeEntry } from "@/entities/TimeEntry";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";
import { resolveProjectLink } from "@/controllers/projects/projectPayload";
import {
  TimeEntryBody,
  assertCustomerInOrg,
  computeTimeFields,
  loadTimeEntry,
  parseDate,
  present,
  toBool,
} from "./timePayload";

const updateTimeEntry = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { orgId } = ctx;
  const { id } = await params;

  try {
    const db = await getDatabase();
    const repo = db.getRepository(TimeEntry);
    const entry = await repo.findOne({
      where: { id: parseInt(id), organizationId: orgId },
    });
    if (!entry) throw new HttpError("Time entry not found", 404);
    if (entry.invoiced) {
      throw new HttpError("An invoiced time entry can no longer be edited", 409);
    }

    const body = (await req.json()) as TimeEntryBody;

    if (body.customerId !== undefined) {
      const customerId = present(body.customerId) ? Number(body.customerId) : null;
      if (customerId) await assertCustomerInOrg(db, customerId, orgId);
      entry.customerId = customerId;
    }
    if (body.projectId !== undefined) {
      const link = await resolveProjectLink(db, orgId, {
        projectId: body.projectId,
        taskId: body.taskId,
        customerId: entry.customerId,
      });
      entry.projectId = link.projectId;
      entry.taskId = link.taskId;
      if (link.project) {
        entry.project = link.project.name;
        entry.customerId = link.project.customerId;
      }
    }
    if (body.project !== undefined && !entry.projectId) entry.project = String(body.project).trim();
    if (body.description !== undefined) entry.description = String(body.description).trim();
    if (body.date !== undefined) entry.date = parseDate(body.date);
    if (body.startTime !== undefined) entry.startTime = body.startTime;
    if (body.endTime !== undefined) entry.endTime = body.endTime;
    if (body.billable !== undefined) entry.billable = toBool(body.billable);
    if (entry.billable && !entry.customerId) {
      throw new HttpError("A customer is required for billable time", 400);
    }

    Object.assign(
      entry,
      computeTimeFields({
        startTime: entry.startTime,
        endTime: entry.endTime,
        hourlyRate: body.hourlyRate ?? entry.hourlyRate,
        billable: entry.billable,
        invoiced: entry.invoiced,
      }),
    );
    await repo.save(entry);

    const result = await loadTimeEntry(db, entry.id, orgId);
    return NextResponse.json({
      message: "Time entry updated successfully",
      timeEntry: result,
    });
  } catch (error) {
    return errorResponse(error, "Failed to update time entry");
  }
};

export default updateTimeEntry;
