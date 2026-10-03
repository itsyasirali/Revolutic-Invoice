import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { TimeEntry } from "@/entities/TimeEntry";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";
import { nextSequenceNumber } from "@/lib/numbering";
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

const createTimeEntry = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { userId, orgId } = ctx;

  try {
    const body = (await req.json()) as TimeEntryBody;
    const db = await getDatabase();

    let customerId = present(body.customerId) ? Number(body.customerId) : null;
    const link = await resolveProjectLink(db, orgId, {
      projectId: body.projectId,
      taskId: body.taskId,
      customerId,
    });
    if (link.project) customerId = link.project.customerId;
    if (customerId) await assertCustomerInOrg(db, customerId, orgId);
    const billable = body.billable === undefined ? true : toBool(body.billable);
    if (billable && !customerId) {
      throw new HttpError("A customer is required for billable time", 400);
    }

    const computed = computeTimeFields({
      startTime: body.startTime,
      endTime: body.endTime,
      hourlyRate: present(body.hourlyRate) ? body.hourlyRate : link.project?.hourlyRate,
      billable,
      invoiced: false,
    });

    const repo = db.getRepository(TimeEntry);
    const entry = repo.create({
      entryNumber: await nextSequenceNumber(repo, "entryNumber", orgId, "TIME"),
      userId,
      customerId,
      project: link.project?.name || String(body.project ?? "").trim() || undefined,
      projectId: link.projectId,
      taskId: link.taskId,
      date: parseDate(body.date ?? new Date().toISOString()),
      startTime: body.startTime,
      endTime: body.endTime,
      description: String(body.description ?? "").trim() || undefined,
      billable,
      invoiced: false,
      invoiceId: null,
      organizationId: orgId,
      ...computed,
    } as Partial<TimeEntry>);
    const saved = await repo.save(entry);

    const result = await loadTimeEntry(db, saved.id, orgId);
    return NextResponse.json(
      { message: "Time entry created successfully", timeEntry: result },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, "Failed to create time entry");
  }
};

export default createTimeEntry;
