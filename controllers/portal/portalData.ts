import { NextRequest, NextResponse } from "next/server";
import { In, Not } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { Quote } from "@/entities/Quote";
import { Payment } from "@/entities/Payment";
import { Project } from "@/entities/Project";
import { ProjectTask } from "@/entities/ProjectTask";
import { TimeEntry } from "@/entities/TimeEntry";
import { PortalComment } from "@/entities/PortalComment";
import { PaymentAppliedInvoice } from "@/entities/PaymentAppliedInvoice";
import { Customer } from "@/entities/Customer";
import { PortalUser } from "@/entities/PortalUser";
import { errorResponse, HttpError } from "@/lib/requestContext";
import { queryRows } from "@/lib/services/sqlRows";
import { loadProjectStats } from "@/controllers/projects/projectStats";
import { sanitizePlainText } from "@/lib/sanitizeHtml";
import { validateEmail, validatePhone } from "@/lib/validation/contact";
import {
  PORTAL_INVOICE_STATUSES,
  PORTAL_QUOTE_STATUSES,
  getPortalContext,
  logPortalActivity,
  requirePermission,
  type PortalContext,
} from "@/lib/portalSession";

type Ctx = { params: Promise<{ id: string }> };

/** Runs a handler with the resolved portal context and uniform error handling. */
const withPortal =
  (fallback: string, handler: (ctx: PortalContext, req: NextRequest, p: Ctx) => Promise<NextResponse>) =>
  async (req: NextRequest, p: Ctx = { params: Promise.resolve({ id: "" }) }) => {
    const ctx = await getPortalContext(req);
    if (ctx instanceof NextResponse) return ctx;
    try {
      return await handler(ctx, req, p);
    } catch (error) {
      return errorResponse(error, fallback);
    }
  };

const idOf = async (p: Ctx) => {
  const id = parseInt((await p.params).id);
  if (!Number.isInteger(id)) throw new HttpError("Invalid id", 400);
  return id;
};

const sumByCurrency = (rows: { currency: string; amount: number }[]) => {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.currency, (map.get(r.currency) || 0) + r.amount);
  return Array.from(map.entries()).map(([currency, amount]) => ({ currency, amount }));
};

/* ------------------------------ dashboard ------------------------------ */

export const portalDashboard = withPortal("Failed to load dashboard", async (ctx) => {
  const db = await getDatabase();
  const where = { organizationId: ctx.orgId, customerId: ctx.customerId };
  const s = ctx.settings;

  const invoices = s.canViewInvoices
    ? await db.getRepository(Invoice).find({
        where: { ...where, status: In(PORTAL_INVOICE_STATUSES) },
        order: { invoiceDate: "DESC" },
      })
    : [];
  const open = invoices.filter((i) => ["Sent", "Partially Paid", "Overdue"].includes(i.status));
  const overdue = open.filter((i) => i.status === "Overdue");

  const lastPayment = s.canViewPayments
    ? await db.getRepository(Payment).findOne({
        where: { ...where, status: Not("Draft") },
        order: { paymentDate: "DESC", id: "DESC" },
      })
    : null;

  const quotes = s.canViewQuotes
    ? await db.getRepository(Quote).find({
        where: { ...where, status: In(["Sent", "Viewed"]) },
        order: { quoteDate: "DESC" },
      })
    : [];

  const awaitingTime = s.canViewTimesheets && s.canApproveTimesheets
    ? await queryRows<{ n: string }>(
        db,
        `SELECT COUNT(*) AS n FROM "time_entries" t
         JOIN "projects" p ON p."id" = t."projectId"
         WHERE t."organizationId" = $1 AND p."customerId" = $2
           AND t."billable" = true AND t."invoiced" = false AND t."approvalStatus" = 'Pending'`,
        [ctx.orgId, ctx.customerId],
      )
    : [{ n: "0" }];

  const comments = await db.getRepository(PortalComment).find({
    where: { ...where, visibleToCustomer: true },
    order: { createdAt: "DESC" },
    take: 5,
  });

  const activity = [
    ...invoices.slice(0, 5).map((i) => ({
      at: i.updatedAt,
      title: `Invoice ${i.invoiceNumber} ${i.status.toLowerCase()}`,
      href: `/portal/invoices/${i.id}`,
    })),
    ...quotes.slice(0, 5).map((q) => ({
      at: q.updatedAt,
      title: `Quote ${q.quoteNumber} is awaiting your approval`,
      href: `/portal/quotes/${q.id}`,
    })),
    ...(lastPayment
      ? [{ at: lastPayment.paymentDate, title: "Payment received", href: `/portal/payments/${lastPayment.id}` }]
      : []),
    ...comments.map((c) => ({
      at: c.createdAt,
      title: `${c.authorType === "customer" ? "You" : "Business"} commented`,
      href: `/portal/${c.entityType}s/${c.entityId}`,
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  return NextResponse.json({
    outstanding: sumByCurrency(open.map((i) => ({ currency: i.currency, amount: Number(i.remaining) }))),
    outstandingCount: open.length,
    overdueCount: overdue.length,
    lastPayment: lastPayment
      ? {
          id: lastPayment.id,
          amount: Number(lastPayment.amountReceived),
          currency: lastPayment.currency,
          date: lastPayment.paymentDate,
        }
      : null,
    quotesAwaiting: quotes.map((q) => ({
      id: q.id,
      quoteNumber: q.quoteNumber,
      total: Number(q.total),
      currency: q.currency,
      expiryDate: q.expiryDate,
    })),
    timesheetsAwaiting: Number(awaitingTime[0]?.n || 0),
    recentInvoices: invoices.slice(0, 5).map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      dueDate: i.dueDate,
      remaining: Number(i.remaining),
      total: Number(i.total),
      currency: i.currency,
      status: i.status,
    })),
    activity,
  });
});

/* ------------------------------- invoices ------------------------------- */

export const portalInvoices = withPortal("Failed to load invoices", async (ctx) => {
  requirePermission(ctx, "canViewInvoices");
  const db = await getDatabase();
  const invoices = await db.getRepository(Invoice).find({
    where: {
      organizationId: ctx.orgId,
      customerId: ctx.customerId,
      status: In(PORTAL_INVOICE_STATUSES),
    },
    order: { invoiceDate: "DESC", id: "DESC" },
  });
  return NextResponse.json({ invoices });
});

export const portalInvoice = withPortal("Failed to load invoice", async (ctx, _req, p) => {
  requirePermission(ctx, "canViewInvoices");
  const db = await getDatabase();
  const invoice = await db.getRepository(Invoice).findOne({
    where: {
      id: await idOf(p),
      organizationId: ctx.orgId,
      customerId: ctx.customerId,
      status: In(PORTAL_INVOICE_STATUSES),
    },
    relations: ["items"],
  });
  if (!invoice) throw new HttpError("Invoice not found", 404);

  const applied = await db.getRepository(PaymentAppliedInvoice).find({
    where: { invoiceId: invoice.id },
    relations: ["payment"],
  });
  await logPortalActivity(ctx, "invoice_viewed", "invoice", invoice.id, `Viewed invoice ${invoice.invoiceNumber}`);
  return NextResponse.json({
    invoice,
    payments: applied
      .filter((a) => a.payment?.organizationId === ctx.orgId && a.payment.status !== "Draft")
      .map((a) => ({
        id: a.payment.id,
        paymentNumber: a.payment.paymentNumber,
        date: a.payment.paymentDate,
        mode: a.payment.paymentMode,
        amount: Number(a.amount),
      })),
  });
});

/* -------------------------------- quotes -------------------------------- */

export const portalQuotes = withPortal("Failed to load quotes", async (ctx) => {
  requirePermission(ctx, "canViewQuotes");
  const db = await getDatabase();
  const quotes = await db.getRepository(Quote).find({
    where: {
      organizationId: ctx.orgId,
      customerId: ctx.customerId,
      status: In(PORTAL_QUOTE_STATUSES),
    },
    order: { quoteDate: "DESC", id: "DESC" },
  });
  return NextResponse.json({ quotes });
});

export const portalQuote = withPortal("Failed to load quote", async (ctx, _req, p) => {
  requirePermission(ctx, "canViewQuotes");
  const db = await getDatabase();
  const id = await idOf(p);
  const find = () =>
    db.getRepository(Quote).findOne({
      where: {
        id,
        organizationId: ctx.orgId,
        customerId: ctx.customerId,
        status: In(PORTAL_QUOTE_STATUSES),
      },
      relations: ["items"],
      order: { items: { sortOrder: "ASC" } },
    });
  let quote = await find();
  if (!quote) throw new HttpError("Quote not found", 404);
  if (quote.status === "Sent") {
    await db.query(
      `UPDATE "quotes" SET "status" = 'Viewed' WHERE "id" = $1 AND "status" = 'Sent'`,
      [quote.id],
    );
    quote = (await find()) || quote;
  }
  await logPortalActivity(ctx, "quote_viewed", "quote", quote.id, `Viewed quote ${quote.quoteNumber}`);
  return NextResponse.json({ quote });
});

const respondToQuote = (decision: "Accepted" | "Declined") =>
  withPortal(`Failed to mark quote ${decision.toLowerCase()}`, async (ctx, _req, p) => {
    requirePermission(ctx, "canViewQuotes");
    const db = await getDatabase();
    const id = await idOf(p);
    const rows = await queryRows<{ id: number; quoteNumber: string }>(
      db,
      `UPDATE "quotes" SET "status" = $1, "updatedAt" = NOW()
       WHERE "id" = $2 AND "organizationId" = $3 AND "customerId" = $4
         AND "status" IN ('Sent', 'Viewed')
         AND ("expiryDate" IS NULL OR "expiryDate" >= NOW())
       RETURNING "id", "quoteNumber"`,
      [decision, id, ctx.orgId, ctx.customerId],
    );
    if (rows.length === 0) {
      throw new HttpError("This quote can no longer be accepted or declined.", 409);
    }
    await logPortalActivity(
      ctx,
      decision === "Accepted" ? "quote_accepted" : "quote_declined",
      "quote",
      id,
      `${decision} quote ${rows[0].quoteNumber}`,
    );
    return NextResponse.json({ message: `Quote ${decision.toLowerCase()}` });
  });

export const portalAcceptQuote = respondToQuote("Accepted");
export const portalDeclineQuote = respondToQuote("Declined");

/* ------------------------------- payments ------------------------------- */

export const portalPayments = withPortal("Failed to load payments", async (ctx) => {
  requirePermission(ctx, "canViewPayments");
  const db = await getDatabase();
  const payments = await db.getRepository(Payment).find({
    where: { organizationId: ctx.orgId, customerId: ctx.customerId, status: Not("Draft") },
    relations: ["appliedInvoices", "appliedInvoices.invoice"],
    order: { paymentDate: "DESC", id: "DESC" },
  });
  return NextResponse.json({
    payments: payments.map((p) => ({
      id: p.id,
      paymentNumber: p.paymentNumber,
      date: p.paymentDate,
      mode: p.paymentMode,
      amount: Number(p.amountReceived),
      currency: p.currency,
      invoices: (p.appliedInvoices || []).map((a) => a.invoice?.invoiceNumber).filter(Boolean),
    })),
  });
});

export const portalPayment = withPortal("Failed to load payment", async (ctx, _req, p) => {
  requirePermission(ctx, "canViewPayments");
  const db = await getDatabase();
  const payment = await db.getRepository(Payment).findOne({
    where: {
      id: await idOf(p),
      organizationId: ctx.orgId,
      customerId: ctx.customerId,
      status: Not("Draft"),
    },
    relations: ["appliedInvoices", "appliedInvoices.invoice"],
  });
  if (!payment) throw new HttpError("Payment not found", 404);
  return NextResponse.json({
    payment: {
      id: payment.id,
      paymentNumber: payment.paymentNumber,
      date: payment.paymentDate,
      mode: payment.paymentMode,
      referenceNo: payment.referenceNo,
      amount: Number(payment.amountReceived),
      currency: payment.currency,
      notes: payment.notes,
      invoices: (payment.appliedInvoices || []).map((a) => ({
        id: a.invoiceId,
        invoiceNumber: a.invoice?.invoiceNumber,
        amount: Number(a.amount),
      })),
    },
  });
});

/* ------------------------------- projects ------------------------------- */

export const portalProjects = withPortal("Failed to load projects", async (ctx) => {
  requirePermission(ctx, "canViewProjects");
  const db = await getDatabase();
  const projects = await db.getRepository(Project).find({
    where: { organizationId: ctx.orgId, customerId: ctx.customerId },
    order: { createdAt: "DESC" },
  });
  const stats = await loadProjectStats(db, ctx.orgId, projects.map((p) => p.id).concat(0));
  return NextResponse.json({
    projects: projects.map((p) => {
      const logged = (stats.get(p.id)?.billableMinutes || 0) / 60;
      const budget = Number(p.budgetHours);
      return {
        id: p.id,
        projectNumber: p.projectNumber,
        name: p.name,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate,
        loggedHours: logged,
        budgetHours: budget,
        progress: p.status === "Completed" ? 100 : budget > 0 ? Math.min(100, Math.round((logged / budget) * 100)) : null,
      };
    }),
  });
});

export const portalProject = withPortal("Failed to load project", async (ctx, _req, p) => {
  requirePermission(ctx, "canViewProjects");
  const db = await getDatabase();
  const project = await db.getRepository(Project).findOne({
    where: { id: await idOf(p), organizationId: ctx.orgId, customerId: ctx.customerId },
  });
  if (!project) throw new HttpError("Project not found", 404);

  const tasks = await db.getRepository(ProjectTask).find({
    where: { projectId: project.id, organizationId: ctx.orgId },
    order: { sortOrder: "ASC", id: "ASC" },
  });
  // Only billable work is shown to the customer.
  const entries = ctx.settings.canViewTimesheets
    ? await db.getRepository(TimeEntry).find({
        where: { projectId: project.id, organizationId: ctx.orgId, billable: true },
        relations: ["task"],
        order: { date: "DESC", id: "DESC" },
      })
    : [];
  const sum = (list: TimeEntry[]) => list.reduce((s, e) => s + e.duration, 0) / 60;
  const taskRows = tasks.map((t) => {
    const mine = entries.filter((e) => e.taskId === t.id);
    return {
      id: t.id,
      name: t.name,
      status: t.status,
      loggedHours: sum(mine),
      billedHours: sum(mine.filter((e) => e.invoiced)),
      unbilledHours: sum(mine.filter((e) => !e.invoiced)),
    };
  });
  return NextResponse.json({
    project: {
      id: project.id,
      projectNumber: project.projectNumber,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      budgetHours: Number(project.budgetHours),
    },
    totals: {
      loggedHours: sum(entries),
      billedHours: sum(entries.filter((e) => e.invoiced)),
      unbilledHours: sum(entries.filter((e) => !e.invoiced)),
    },
    tasks: taskRows,
    timeEntries: entries.map((e) => ({
      id: e.id,
      date: e.date,
      task: e.task?.name || null,
      description: e.description,
      duration: e.duration,
      billing: e.invoiced ? "Billed" : "Unbilled",
      approvalStatus: e.approvalStatus,
    })),
    canApprove: ctx.settings.canApproveTimesheets,
  });
});

/** POST { ids: number[], action: 'approve' | 'reject' } on this customer's unbilled project time. */
export const portalReviewTime = withPortal("Failed to update time entries", async (ctx, req) => {
  requirePermission(ctx, "canViewTimesheets");
  requirePermission(ctx, "canApproveTimesheets");
  const body = (await req.json()) as { ids?: unknown; action?: string };
  const ids = (Array.isArray(body.ids) ? body.ids : [])
    .map((v) => parseInt(String(v)))
    .filter((n) => Number.isInteger(n));
  if (ids.length === 0) throw new HttpError("No time entries selected", 400);
  if (body.action !== "approve" && body.action !== "reject") {
    throw new HttpError("Invalid action", 400);
  }
  const status = body.action === "approve" ? "Approved" : "Rejected";
  const db = await getDatabase();
  const rows = await queryRows(
    db,
    `UPDATE "time_entries" t SET "approvalStatus" = $1, "approvedAt" = NOW()
     FROM "projects" p
     WHERE t."id" = ANY($2::int[]) AND t."organizationId" = $3
       AND p."id" = t."projectId" AND p."customerId" = $4
       AND t."billable" = true AND t."invoiced" = false
     RETURNING t."id"`,
    [status, ids, ctx.orgId, ctx.customerId],
  );
  if (rows.length === 0) throw new HttpError("These time entries can no longer be reviewed.", 409);
  await logPortalActivity(
    ctx,
    body.action === "approve" ? "time_approved" : "time_rejected",
    "time",
    null,
    `${status} ${rows.length} time ${rows.length === 1 ? "entry" : "entries"}`,
  );
  return NextResponse.json({ message: `Time ${status.toLowerCase()}`, updated: rows.length });
});

/** Time entries awaiting this customer's approval, across their projects. */
export const portalPendingTime = withPortal("Failed to load timesheets", async (ctx) => {
  requirePermission(ctx, "canViewTimesheets");
  const db = await getDatabase();
  const rows = await queryRows<Record<string, unknown>>(
    db,
    `SELECT t."id", t."date", t."duration", t."entryNumber", t."projectId", p."projectNumber",
            t."taskId", t."approvalStatus"
     FROM "time_entries" t JOIN "projects" p ON p."id" = t."projectId"
     WHERE t."organizationId" = $1 AND p."customerId" = $2
       AND t."billable" = true AND t."invoiced" = false AND t."approvalStatus" = 'Pending'
     ORDER BY t."date" DESC, t."id" DESC`,
    [ctx.orgId, ctx.customerId],
  );
  return NextResponse.json({ entries: rows });
});

/* ------------------------------- statements ------------------------------ */

export const portalStatement = withPortal("Failed to build statement", async (ctx, req) => {
  requirePermission(ctx, "canViewInvoices");
  const params = req.nextUrl.searchParams;
  const to = params.get("to") ? new Date(String(params.get("to"))) : new Date();
  const from = params.get("from")
    ? new Date(String(params.get("from")))
    : new Date(to.getFullYear(), to.getMonth(), 1);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) throw new HttpError("Invalid date range", 400);
  to.setHours(23, 59, 59, 999);
  from.setHours(0, 0, 0, 0);

  const db = await getDatabase();
  const [invoices, payments] = await Promise.all([
    db.getRepository(Invoice).find({
      where: { organizationId: ctx.orgId, customerId: ctx.customerId, status: In(PORTAL_INVOICE_STATUSES) },
      order: { invoiceDate: "ASC", id: "ASC" },
    }),
    db.getRepository(Payment).find({
      where: { organizationId: ctx.orgId, customerId: ctx.customerId, status: Not("Draft") },
      order: { paymentDate: "ASC", id: "ASC" },
    }),
  ]);

  type Line = { date: Date; type: "Invoice" | "Payment"; reference: string; charge: number; payment: number };
  const byCurrency = new Map<string, { opening: number; lines: Line[] }>();
  const bucket = (c: string) => {
    if (!byCurrency.has(c)) byCurrency.set(c, { opening: 0, lines: [] });
    return byCurrency.get(c)!;
  };
  for (const i of invoices) {
    const b = bucket(i.currency);
    const d = new Date(i.invoiceDate);
    const total = Number(i.total);
    if (d < from) b.opening += total;
    else if (d <= to) {
      b.lines.push({ date: d, type: "Invoice", reference: i.invoiceNumber, charge: total, payment: 0 });
    }
  }
  for (const pay of payments) {
    const b = bucket(pay.currency);
    const d = new Date(pay.paymentDate);
    const amt = Number(pay.amountReceived);
    if (d < from) b.opening -= amt;
    else if (d <= to) {
      b.lines.push({ date: d, type: "Payment", reference: `Payment #${pay.paymentNumber ?? pay.id}`, charge: 0, payment: amt });
    }
  }

  const statements = Array.from(byCurrency.entries()).map(([currency, b]) => {
    const lines = b.lines.sort((a, c) => a.date.getTime() - c.date.getTime());
    let running = b.opening;
    const withBalance = lines.map((l) => {
      running += l.charge - l.payment;
      return { ...l, balance: running };
    });
    return {
      currency,
      opening: b.opening,
      invoiced: lines.reduce((s, l) => s + l.charge, 0),
      paid: lines.reduce((s, l) => s + l.payment, 0),
      closing: running,
      lines: withBalance,
    };
  });
  return NextResponse.json({ from, to, statements });
});

/* -------------------------------- comments ------------------------------- */

const COMMENT_TYPES = ["invoice", "quote", "project"];

/** Verifies the entity belongs to this customer and is visible to them. */
const assertEntityVisible = async (ctx: PortalContext, entityType: string, entityId: number) => {
  const db = await getDatabase();
  const where = { id: entityId, organizationId: ctx.orgId, customerId: ctx.customerId };
  if (entityType === "invoice") {
    requirePermission(ctx, "canViewInvoices");
    const e = await db.getRepository(Invoice).findOne({ where: { ...where, status: In(PORTAL_INVOICE_STATUSES) } });
    if (!e) throw new HttpError("Invoice not found", 404);
    return `invoice ${e.invoiceNumber}`;
  }
  if (entityType === "quote") {
    requirePermission(ctx, "canViewQuotes");
    const e = await db.getRepository(Quote).findOne({ where: { ...where, status: In(PORTAL_QUOTE_STATUSES) } });
    if (!e) throw new HttpError("Quote not found", 404);
    return `quote ${e.quoteNumber}`;
  }
  if (entityType === "project") {
    requirePermission(ctx, "canViewProjects");
    const e = await db.getRepository(Project).findOne({ where });
    if (!e) throw new HttpError("Project not found", 404);
    return `project ${e.projectNumber}`;
  }
  throw new HttpError("Invalid comment target", 400);
};

export const portalComments = withPortal("Failed to load comments", async (ctx, req) => {
  const type = req.nextUrl.searchParams.get("entityType") || "";
  const id = parseInt(req.nextUrl.searchParams.get("entityId") || "");
  if (!COMMENT_TYPES.includes(type) || !Number.isInteger(id)) throw new HttpError("Invalid request", 400);
  await assertEntityVisible(ctx, type, id);
  const db = await getDatabase();
  const comments = await db.getRepository(PortalComment).find({
    where: {
      organizationId: ctx.orgId,
      customerId: ctx.customerId,
      entityType: type,
      entityId: id,
      visibleToCustomer: true,
    },
    order: { createdAt: "ASC" },
  });
  return NextResponse.json({
    comments: comments.map((c) => ({
      id: c.id,
      authorType: c.authorType,
      authorName: c.authorName,
      message: c.message,
      createdAt: c.createdAt,
    })),
    canComment: ctx.settings.canComment,
  });
});

export const portalAddComment = withPortal("Failed to add comment", async (ctx, req) => {
  requirePermission(ctx, "canComment");
  const body = (await req.json()) as { entityType?: string; entityId?: number | string; message?: string };
  const type = String(body.entityType || "");
  const id = parseInt(String(body.entityId));
  const message = sanitizePlainText(String(body.message ?? "").trim());
  if (!COMMENT_TYPES.includes(type) || !Number.isInteger(id)) throw new HttpError("Invalid request", 400);
  if (!message) throw new HttpError("Comment cannot be empty", 400);
  if (message.length > 2000) throw new HttpError("Comment is too long", 400);
  const label = await assertEntityVisible(ctx, type, id);

  const db = await getDatabase();
  const repo = db.getRepository(PortalComment);
  const saved = await repo.save(
    repo.create({
      organizationId: ctx.orgId,
      customerId: ctx.customerId,
      entityType: type,
      entityId: id,
      authorType: "customer",
      authorName: ctx.portalUser.name || ctx.customer.displayName,
      message,
      visibleToCustomer: true,
    }),
  );
  await logPortalActivity(ctx, "comment_added", type, id, `Commented on ${label}`);
  return NextResponse.json({ comment: saved }, { status: 201 });
});

/* -------------------------------- profile -------------------------------- */

export const portalUpdateProfile = withPortal("Failed to update profile", async (ctx, req) => {
  requirePermission(ctx, "canEditProfile");
  const body = (await req.json()) as {
    name?: string;
    companyName?: string;
    address?: string;
    contacts?: { firstName?: string; lastName?: string; email?: string; contact?: string }[];
  };
  const db = await getDatabase();
  const customerRepo = db.getRepository(Customer);
  const customer = await customerRepo.findOne({
    where: { id: ctx.customerId, organizationId: ctx.orgId },
  });
  if (!customer) throw new HttpError("Customer not found", 404);

  if (body.companyName !== undefined) customer.companyName = sanitizePlainText(String(body.companyName).trim()) || "";
  if (body.address !== undefined) customer.address = sanitizePlainText(String(body.address).trim()) || "";
  if (body.contacts !== undefined) {
    if (!Array.isArray(body.contacts) || body.contacts.length > 20) {
      throw new HttpError("Invalid contacts", 400);
    }
    customer.contacts = body.contacts.map((c) => {
      const emailError = validateEmail(c.email);
      if (emailError) throw new HttpError(emailError, 400);
      const phoneError = validatePhone(c.contact);
      if (phoneError) throw new HttpError(phoneError, 400);
      return {
        firstName: sanitizePlainText(String(c.firstName ?? "").trim()) || "",
        lastName: sanitizePlainText(String(c.lastName ?? "").trim()) || "",
        email: String(c.email ?? "").trim(),
        contact: String(c.contact ?? "").trim(),
      };
    });
  }
  await customerRepo.save(customer);
  if (body.name !== undefined) {
    await db
      .getRepository(PortalUser)
      .update({ id: ctx.portalUser.id }, { name: sanitizePlainText(String(body.name).trim()) || null });
  }
  await logPortalActivity(ctx, "profile_updated", "customer", ctx.customerId, "Updated profile details");
  return NextResponse.json({ message: "Profile updated" });
});
