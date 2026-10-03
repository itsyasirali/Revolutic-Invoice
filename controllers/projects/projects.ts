import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Project } from "@/entities/Project";
import { ProjectTask } from "@/entities/ProjectTask";
import { Customer } from "@/entities/Customer";
import { TimeEntry } from "@/entities/TimeEntry";
import { Expense } from "@/entities/Expense";
import { Quote } from "@/entities/Quote";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";
import { nextSequenceNumber, round2 } from "@/lib/numbering";
import { createInvoiceRecord } from "@/controllers/invoices/createInvoice";
import {
  claimBillable,
  releaseClaim,
  linkToInvoice,
  timeApprovalRequired,
} from "@/lib/services/billingService";
import { queryRows } from "@/lib/services/sqlRows";
import { loadQuote } from "@/controllers/quotes/quotePayload";
import {
  BILLING_METHODS,
  PROJECT_STATUSES,
  isPresent,
  loadProject,
  type ProjectBody,
} from "./projectPayload";
import { emptyStats, loadProjectStats } from "./projectStats";

type Ctx = { params: Promise<{ id: string }> };

const parseOptionalDate = (v: unknown): Date | null => {
  if (!isPresent(v)) return null;
  const d = new Date(String(v));
  if (isNaN(d.getTime())) throw new HttpError("Invalid date", 400);
  return d;
};

const nonNegative = (v: unknown, label: string) => {
  const n = Number(v ?? 0) || 0;
  if (n < 0) throw new HttpError(`${label} must not be negative`, 400);
  return n;
};

const assertCustomer = async (db: Awaited<ReturnType<typeof getDatabase>>, id: number, orgId: number) => {
  const customer = await db
    .getRepository(Customer)
    .findOne({ where: { id, organizationId: orgId } });
  if (!customer) throw new HttpError("Customer not found in this organization", 404);
  return customer;
};

const validateEnums = (body: ProjectBody) => {
  if (body.status && !PROJECT_STATUSES.includes(body.status as never)) {
    throw new HttpError("Invalid project status", 400);
  }
  if (body.billingMethod && !BILLING_METHODS.includes(body.billingMethod as never)) {
    throw new HttpError("Invalid billing method", 400);
  }
};

export const getAllProjects = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const db = await getDatabase();
    const projects = await db.getRepository(Project).find({
      where: { organizationId: ctx.orgId },
      relations: ["customer"],
      order: { createdAt: "DESC" },
    });
    const stats = await loadProjectStats(db, ctx.orgId);
    return NextResponse.json({
      projects: projects.map((p) => ({ ...p, stats: stats.get(p.id) ?? emptyStats() })),
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch projects");
  }
};

export const getProject = async (req: NextRequest, { params }: Ctx) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;
  try {
    const db = await getDatabase();
    const project = await loadProject(db, parseInt(id), ctx.orgId);
    if (!project) throw new HttpError("Project not found", 404);
    const tasks = await db.getRepository(ProjectTask).find({
      where: { projectId: project.id, organizationId: ctx.orgId },
      order: { sortOrder: "ASC", id: "ASC" },
    });
    const stats = (await loadProjectStats(db, ctx.orgId, [project.id])).get(project.id);
    const [timeEntries, expenses] = await Promise.all([
      db.getRepository(TimeEntry).find({
        where: { projectId: project.id, organizationId: ctx.orgId },
        relations: ["task", "invoice"],
        order: { date: "DESC", id: "DESC" },
      }),
      db.getRepository(Expense).find({
        where: { projectId: project.id, organizationId: ctx.orgId },
        relations: ["category", "invoice"],
        order: { expenseDate: "DESC", id: "DESC" },
      }),
    ]);
    const quote = project.quoteId
      ? await db
          .getRepository(Quote)
          .findOne({ where: { id: project.quoteId, organizationId: ctx.orgId } })
      : null;
    const invoiceIds = Array.from(
      new Set(
        [
          project.fixedInvoiceId,
          ...timeEntries.map((t) => t.invoiceId),
          ...expenses.map((e) => e.invoiceId),
        ].filter((v): v is number => !!v),
      ),
    );
    const invoices = invoiceIds.length
      ? await queryRows<Record<string, unknown>>(
          db,
          `SELECT "id", "invoiceNumber", "status", "total", "currency" FROM "invoices"
           WHERE "id" = ANY($1::int[]) AND "organizationId" = $2 ORDER BY "id" DESC`,
          [invoiceIds, ctx.orgId],
        )
      : [];
    return NextResponse.json({
      project: { ...project, stats: stats ?? emptyStats() },
      tasks,
      timeEntries,
      expenses,
      quote,
      invoices,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch project");
  }
};

export const createProject = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { userId, orgId } = ctx;
  try {
    const body = (await req.json()) as ProjectBody & { tasks?: string[] };
    validateEnums(body);
    const name = String(body.name ?? "").trim();
    if (!name) throw new HttpError("Project name is required", 400);
    if (!isPresent(body.customerId)) throw new HttpError("Customer is required", 400);

    const db = await getDatabase();
    const customer = await assertCustomer(db, Number(body.customerId), orgId);
    const repo = db.getRepository(Project);
    const project = repo.create({
      projectNumber: await nextSequenceNumber(repo, "projectNumber", orgId, "PRJ"),
      name,
      description: String(body.description ?? "").trim() || null,
      customerId: customer.id,
      status: body.status || "Active",
      billingMethod: body.billingMethod || "Hourly",
      hourlyRate: nonNegative(body.hourlyRate, "Hourly rate"),
      fixedAmount: nonNegative(body.fixedAmount, "Fixed amount"),
      budgetHours: nonNegative(body.budgetHours, "Budget hours"),
      budgetAmount: nonNegative(body.budgetAmount, "Budget amount"),
      currency: body.currency || customer.currency || "PKR",
      startDate: parseOptionalDate(body.startDate),
      endDate: parseOptionalDate(body.endDate),
      userId,
      organizationId: orgId,
    } as Partial<Project>);
    const saved = await repo.save(project);

    const taskNames = (Array.isArray(body.tasks) ? body.tasks : [])
      .map((t) => String(t).trim())
      .filter(Boolean);
    if (taskNames.length) {
      await db.getRepository(ProjectTask).save(
        taskNames.map((n, i) =>
          db.getRepository(ProjectTask).create({
            projectId: saved.id,
            name: n,
            sortOrder: i,
            organizationId: orgId,
          } as Partial<ProjectTask>),
        ),
      );
    }
    return NextResponse.json(
      { message: "Project created successfully", project: await loadProject(db, saved.id, orgId) },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, "Failed to create project");
  }
};

export const updateProject = async (req: NextRequest, { params }: Ctx) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { orgId } = ctx;
  const { id } = await params;
  try {
    const body = (await req.json()) as ProjectBody;
    validateEnums(body);
    const db = await getDatabase();
    const repo = db.getRepository(Project);
    const project = await repo.findOne({ where: { id: parseInt(id), organizationId: orgId } });
    if (!project) throw new HttpError("Project not found", 404);

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) throw new HttpError("Project name is required", 400);
      project.name = name;
    }
    if (body.description !== undefined) {
      project.description = String(body.description).trim() || null;
    }
    if (body.customerId !== undefined && Number(body.customerId) !== project.customerId) {
      const linked = await queryRows<{ n: string }>(
        db,
        `SELECT (SELECT COUNT(*) FROM "time_entries" WHERE "projectId" = $1)
              + (SELECT COUNT(*) FROM "expenses" WHERE "projectId" = $1) AS n`,
        [project.id],
      );
      if (Number(linked[0]?.n) > 0) {
        throw new HttpError(
          "The customer cannot be changed once time or expenses are logged on the project",
          409,
        );
      }
      await assertCustomer(db, Number(body.customerId), orgId);
      project.customerId = Number(body.customerId);
    }
    if (body.status) project.status = body.status;
    if (body.billingMethod) project.billingMethod = body.billingMethod;
    if (body.hourlyRate !== undefined) project.hourlyRate = nonNegative(body.hourlyRate, "Hourly rate");
    if (body.fixedAmount !== undefined) project.fixedAmount = nonNegative(body.fixedAmount, "Fixed amount");
    if (body.budgetHours !== undefined) project.budgetHours = nonNegative(body.budgetHours, "Budget hours");
    if (body.budgetAmount !== undefined) project.budgetAmount = nonNegative(body.budgetAmount, "Budget amount");
    if (body.currency) project.currency = body.currency;
    if (body.startDate !== undefined) project.startDate = parseOptionalDate(body.startDate);
    if (body.endDate !== undefined) project.endDate = parseOptionalDate(body.endDate);
    await repo.save(project);

    // Keep the project-name snapshot on its time entries in sync.
    if (body.name !== undefined) {
      await db.getRepository(TimeEntry).update(
        { projectId: project.id, organizationId: orgId },
        { project: project.name },
      );
    }
    return NextResponse.json({
      message: "Project updated successfully",
      project: await loadProject(db, project.id, orgId),
    });
  } catch (error) {
    return errorResponse(error, "Failed to update project");
  }
};

export const deleteProject = async (req: NextRequest, { params }: Ctx) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { orgId } = ctx;
  const { id } = await params;
  try {
    const db = await getDatabase();
    const project = await db
      .getRepository(Project)
      .findOne({ where: { id: parseInt(id), organizationId: orgId } });
    if (!project) throw new HttpError("Project not found", 404);

    const billed = await queryRows<{ n: string }>(
      db,
      `SELECT (SELECT COUNT(*) FROM "time_entries" WHERE "projectId" = $1 AND "invoiced" = true)
            + (SELECT COUNT(*) FROM "expenses" WHERE "projectId" = $1 AND "invoiced" = true) AS n`,
      [project.id],
    );
    if (project.fixedInvoiceId || Number(billed[0]?.n) > 0) {
      throw new HttpError("A project that has been invoiced cannot be deleted", 409);
    }
    // Free the quote so a new project can be created from it again.
    await db.query(
      `UPDATE "quotes" SET "projectId" = NULL WHERE "projectId" = $1 AND "organizationId" = $2`,
      [project.id, orgId],
    );
    await db.getRepository(Project).delete({ id: project.id, organizationId: orgId });
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to delete project");
  }
};

/* ------------------------------ tasks ------------------------------ */

const TASK_STATUSES = ["Open", "Completed"];

export const createTask = async (req: NextRequest, { params }: Ctx) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;
  try {
    const body = (await req.json()) as { name?: string; description?: string };
    const name = String(body.name ?? "").trim();
    if (!name) throw new HttpError("Task name is required", 400);
    const db = await getDatabase();
    const project = await loadProject(db, parseInt(id), ctx.orgId);
    if (!project) throw new HttpError("Project not found", 404);
    const repo = db.getRepository(ProjectTask);
    const count = await repo.count({ where: { projectId: project.id } });
    const task = await repo.save(
      repo.create({
        projectId: project.id,
        name,
        description: String(body.description ?? "").trim() || null,
        sortOrder: count,
        organizationId: ctx.orgId,
      } as Partial<ProjectTask>),
    );
    return NextResponse.json({ message: "Task added", task }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to add task");
  }
};

export const updateTask = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { id, taskId } = await params;
  try {
    const body = (await req.json()) as { name?: string; description?: string; status?: string };
    const db = await getDatabase();
    const repo = db.getRepository(ProjectTask);
    const task = await repo.findOne({
      where: { id: parseInt(taskId), projectId: parseInt(id), organizationId: ctx.orgId },
    });
    if (!task) throw new HttpError("Task not found", 404);
    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) throw new HttpError("Task name is required", 400);
      task.name = name;
    }
    if (body.description !== undefined) task.description = String(body.description).trim() || null;
    if (body.status !== undefined) {
      if (!TASK_STATUSES.includes(body.status)) throw new HttpError("Invalid task status", 400);
      task.status = body.status;
    }
    return NextResponse.json({ message: "Task updated", task: await repo.save(task) });
  } catch (error) {
    return errorResponse(error, "Failed to update task");
  }
};

export const deleteTask = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { id, taskId } = await params;
  try {
    const db = await getDatabase();
    const result = await db.getRepository(ProjectTask).delete({
      id: parseInt(taskId),
      projectId: parseInt(id),
      organizationId: ctx.orgId,
    });
    if (!result.affected) throw new HttpError("Task not found", 404);
    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    return errorResponse(error, "Failed to delete task");
  }
};

/* --------------------------- project -> invoice --------------------------- */

/**
 * POST /api/projects/:id/invoice  { dueDate?, templateId? }
 * Bills every billable, un-invoiced time entry and expense of the project in
 * one invoice. Fixed-price projects bill `fixedAmount` once instead of time.
 */
export const billProject = async (req: NextRequest, { params }: Ctx) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { userId, orgId } = ctx;
  const { id } = await params;
  const projectId = parseInt(id);

  try {
    const body = (await req.json().catch(() => ({}))) as { dueDate?: string; templateId?: number };
    const db = await getDatabase();
    const project = await loadProject(db, projectId, orgId);
    if (!project) throw new HttpError("Project not found", 404);

    const fixed = project.billingMethod === "Fixed";
    const billFixedFee = fixed && !project.fixedInvoiceId && Number(project.fixedAmount) > 0;

    const needsApproval = await timeApprovalRequired(db, orgId);
    const pending = async (table: "time_entries" | "expenses") =>
      (
        await queryRows<{ id: number }>(
          db,
          `SELECT "id" FROM "${table}"
           WHERE "projectId" = $1 AND "organizationId" = $2
             AND "billable" = true AND "invoiced" = false
             ${table === "time_entries" && needsApproval ? `AND "approvalStatus" = 'Approved'` : ""}`,
          [projectId, orgId],
        )
      ).map((r) => r.id);

    const timeIds = await pending("time_entries");
    const expenseIds = await pending("expenses");
    if (!billFixedFee && (fixed ? 0 : timeIds.length) + expenseIds.length === 0) {
      throw new HttpError("There is nothing to bill on this project", 400);
    }

    const claimedTime = await claimBillable(db, "time_entries", orgId, timeIds);
    const claimedExpenses = await claimBillable(db, "expenses", orgId, expenseIds);

    try {
      const [entries, expenses] = await Promise.all([
        claimedTime.length
          ? db.getRepository(TimeEntry).find({
              where: { id: In(claimedTime), organizationId: orgId },
              order: { date: "ASC", id: "ASC" },
            })
          : [],
        claimedExpenses.length
          ? db.getRepository(Expense).find({
              where: { id: In(claimedExpenses), organizationId: orgId },
              relations: ["category"],
              order: { expenseDate: "ASC", id: "ASC" },
            })
          : [],
      ]);

      const items: Record<string, unknown>[] = [];
      if (billFixedFee) {
        items.push({
          itemId: null,
          title: project.name,
          description: `${project.projectNumber} - Fixed price`,
          quantity: 1,
          rate: round2(Number(project.fixedAmount)),
          amount: round2(Number(project.fixedAmount)),
        });
      }
      if (!fixed) {
        for (const e of entries) {
          items.push({
            itemId: null,
            title: project.name,
            description: [e.entryNumber, new Date(e.date).toLocaleDateString("en-GB"), e.description]
              .filter(Boolean)
              .join(" - "),
            quantity: round2(e.duration / 60),
            rate: Number(e.hourlyRate),
            amount: Number(e.amount),
          });
        }
      }
      for (const e of expenses) {
        items.push({
          itemId: null,
          title: e.category?.name || e.vendor || "Expense",
          description: [project.name, e.expenseNumber, e.vendor, e.description]
            .filter(Boolean)
            .join(" - "),
          quantity: 1,
          rate: round2(Number(e.total)),
          amount: round2(Number(e.total)),
        });
      }
      if (items.length === 0) throw new HttpError("There is nothing to bill on this project", 400);

      const invoice = await createInvoiceRecord(
        userId,
        {
          customerId: project.customerId,
          templateId: body.templateId,
          invoiceNumber: "",
          invoiceDate: new Date().toISOString(),
          dueDate: body.dueDate,
          currency: project.currency,
          items,
        } as unknown as Parameters<typeof createInvoiceRecord>[1],
        orgId,
      );

      await linkToInvoice(db, "time_entries", claimedTime, invoice.id);
      await linkToInvoice(db, "expenses", claimedExpenses, invoice.id);
      if (billFixedFee) {
        await db.getRepository(Project).update({ id: project.id }, { fixedInvoiceId: invoice.id });
      }
      return NextResponse.json(
        { message: "Invoice created from project", invoice },
        { status: 201 },
      );
    } catch (inner) {
      await releaseClaim(db, "time_entries", claimedTime);
      await releaseClaim(db, "expenses", claimedExpenses);
      throw inner;
    }
  } catch (error) {
    return errorResponse(error, "Failed to create invoice from project");
  }
};

/* --------------------------- quote -> project --------------------------- */

const PROJECT_QUOTE_STATUSES = ["Sent", "Viewed", "Accepted", "Converted"];

/** POST /api/quotes/:id/project — creates a project (with tasks from the quote lines). */
export const createProjectFromQuote = async (req: NextRequest, { params }: Ctx) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { userId, orgId } = ctx;
  const { id } = await params;

  try {
    const db = await getDatabase();
    const quote = await loadQuote(db, parseInt(id), orgId);
    if (!quote) throw new HttpError("Quote not found", 404);
    if (!PROJECT_QUOTE_STATUSES.includes(quote.status)) {
      throw new HttpError(`A ${quote.status} quote cannot be turned into a project`, 409);
    }

    // Claim the quote atomically so only one project is ever created from it.
    const claimed = await queryRows(
      db,
      `UPDATE "quotes" SET "projectId" = 0
       WHERE "id" = $1 AND "organizationId" = $2 AND "projectId" IS NULL RETURNING "id"`,
      [quote.id, orgId],
    );
    if (claimed.length === 0) throw new HttpError("A project already exists for this quote", 409);

    try {
      const repo = db.getRepository(Project);
      const total = round2(Number(quote.total));
      const project = await repo.save(
        repo.create({
          projectNumber: await nextSequenceNumber(repo, "projectNumber", orgId, "PRJ"),
          name: quote.referenceNumber || `Project for ${quote.quoteNumber}`,
          description: `Created from quote ${quote.quoteNumber}`,
          customerId: quote.customerId,
          quoteId: quote.id,
          status: "Active",
          billingMethod: "Fixed",
          fixedAmount: total,
          budgetAmount: total,
          currency: quote.currency,
          startDate: new Date(),
          userId,
          organizationId: orgId,
        } as Partial<Project>),
      );

      const taskRepo = db.getRepository(ProjectTask);
      const names = (quote.items || []).map((i) => String(i.name || "").trim()).filter(Boolean);
      if (names.length) {
        await taskRepo.save(
          names.map((name, i) =>
            taskRepo.create({
              projectId: project.id,
              name,
              sortOrder: i,
              organizationId: orgId,
            } as Partial<ProjectTask>),
          ),
        );
      }
      await db.query(`UPDATE "quotes" SET "projectId" = $1 WHERE "id" = $2`, [project.id, quote.id]);
      return NextResponse.json(
        { message: "Project created from quote", project: await loadProject(db, project.id, orgId) },
        { status: 201 },
      );
    } catch (inner) {
      await db.query(`UPDATE "quotes" SET "projectId" = NULL WHERE "id" = $1`, [quote.id]);
      throw inner;
    }
  } catch (error) {
    return errorResponse(error, "Failed to create project from quote");
  }
};
