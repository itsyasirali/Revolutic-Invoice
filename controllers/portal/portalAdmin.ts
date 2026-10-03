import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Organization } from "@/entities/Organization";
import { Customer } from "@/entities/Customer";
import { PortalUser } from "@/entities/PortalUser";
import { PortalActivity } from "@/entities/PortalActivity";
import { PortalComment } from "@/entities/PortalComment";
import { Invoice } from "@/entities/Invoice";
import { Quote } from "@/entities/Quote";
import { Project } from "@/entities/Project";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";
import { hashToken } from "@/lib/portalSession";
import { createMailTransporter, getMailFromAddress, getMailFromName } from "@/lib/mailer";
import { sanitizePlainText } from "@/lib/sanitizeHtml";
import { validateEmail } from "@/lib/validation/contact";
import {
  DEFAULT_PORTAL_SETTINGS,
  resolvePortalSettings,
  type PortalSettings,
} from "@/types/portal";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/* ------------------------------- settings ------------------------------- */

export const getPortalSettings = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const db = await getDatabase();
    const org = await db.getRepository(Organization).findOne({ where: { id: ctx.orgId } });
    if (!org) throw new HttpError("Organization not found", 404);
    return NextResponse.json({
      settings: resolvePortalSettings(org.portalSettings as Partial<PortalSettings> | null),
    });
  } catch (error) {
    return errorResponse(error, "Failed to load portal settings");
  }
};

export const updatePortalSettings = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const body = (await req.json()) as Partial<PortalSettings>;
    const db = await getDatabase();
    const repo = db.getRepository(Organization);
    const org = await repo.findOne({ where: { id: ctx.orgId } });
    if (!org) throw new HttpError("Organization not found", 404);

    const current = resolvePortalSettings(org.portalSettings as Partial<PortalSettings> | null);
    const next: PortalSettings = { ...current, notify: { ...current.notify } };
    // Only known keys are accepted; booleans are coerced, text is sanitized.
    for (const key of Object.keys(DEFAULT_PORTAL_SETTINGS) as (keyof PortalSettings)[]) {
      if (key === "notify" || body[key] === undefined) continue;
      const fallback = DEFAULT_PORTAL_SETTINGS[key];
      if (typeof fallback === "boolean") (next[key] as boolean) = body[key] === true;
      else if (typeof fallback === "string") {
        (next[key] as string) = sanitizePlainText(String(body[key]).trim().slice(0, 300)) || "";
      }
    }
    for (const key of Object.keys(DEFAULT_PORTAL_SETTINGS.notify) as (keyof PortalSettings["notify"])[]) {
      if (body.notify && body.notify[key] !== undefined) next.notify[key] = body.notify[key] === true;
    }
    org.portalSettings = next as unknown as Record<string, unknown>;
    await repo.save(org);
    return NextResponse.json({ message: "Portal settings saved", settings: next });
  } catch (error) {
    return errorResponse(error, "Failed to save portal settings");
  }
};

/* ------------------------------- activity ------------------------------- */

export const getPortalActivity = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const db = await getDatabase();
    const activities = await db.getRepository(PortalActivity).find({
      where: { organizationId: ctx.orgId },
      order: { createdAt: "DESC" },
      take: 50,
    });
    const customerIds = Array.from(new Set(activities.map((a) => a.customerId)));
    const customers = customerIds.length
      ? await db.getRepository(Customer).find({ where: { id: In(customerIds), organizationId: ctx.orgId } })
      : [];
    const names = new Map(customers.map((c) => [c.id, c.displayName]));
    return NextResponse.json({
      activities: activities.map((a) => ({ ...a, customerName: names.get(a.customerId) || "" })),
      unread: activities.filter((a) => !a.readAt).length,
    });
  } catch (error) {
    return errorResponse(error, "Failed to load portal activity");
  }
};

export const markPortalActivityRead = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const db = await getDatabase();
    await db.query(
      `UPDATE "portal_activities" SET "readAt" = NOW() WHERE "organizationId" = $1 AND "readAt" IS NULL`,
      [ctx.orgId],
    );
    return NextResponse.json({ message: "Marked as read" });
  } catch (error) {
    return errorResponse(error, "Failed to update activity");
  }
};

/* ------------------------------- comments ------------------------------- */

/** Finds the entity inside the active organization and returns its customer. */
const entityCustomerId = async (orgId: number, type: string, id: number) => {
  const db = await getDatabase();
  const where = { id, organizationId: orgId };
  const entity =
    type === "invoice"
      ? await db.getRepository(Invoice).findOne({ where })
      : type === "quote"
        ? await db.getRepository(Quote).findOne({ where })
        : type === "project"
          ? await db.getRepository(Project).findOne({ where })
          : null;
  if (!entity) throw new HttpError("Record not found", 404);
  return entity.customerId;
};

export const listBusinessComments = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const type = req.nextUrl.searchParams.get("entityType") || "";
    const id = parseInt(req.nextUrl.searchParams.get("entityId") || "");
    if (!Number.isInteger(id)) throw new HttpError("Invalid request", 400);
    await entityCustomerId(ctx.orgId, type, id);
    const db = await getDatabase();
    const comments = await db.getRepository(PortalComment).find({
      where: { organizationId: ctx.orgId, entityType: type, entityId: id },
      order: { createdAt: "ASC" },
    });
    return NextResponse.json({ comments });
  } catch (error) {
    return errorResponse(error, "Failed to load comments");
  }
};

export const replyToComment = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const body = (await req.json()) as {
      entityType?: string;
      entityId?: number | string;
      message?: string;
      visibleToCustomer?: boolean;
    };
    const type = String(body.entityType || "");
    const id = parseInt(String(body.entityId));
    const message = sanitizePlainText(String(body.message ?? "").trim());
    if (!Number.isInteger(id)) throw new HttpError("Invalid request", 400);
    if (!message) throw new HttpError("Comment cannot be empty", 400);
    if (message.length > 2000) throw new HttpError("Comment is too long", 400);
    const customerId = await entityCustomerId(ctx.orgId, type, id);

    const db = await getDatabase();
    const repo = db.getRepository(PortalComment);
    const saved = await repo.save(
      repo.create({
        organizationId: ctx.orgId,
        customerId,
        entityType: type,
        entityId: id,
        authorType: "business",
        authorName: "You",
        message,
        visibleToCustomer: body.visibleToCustomer !== false,
      }),
    );
    return NextResponse.json({ comment: saved }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to add comment");
  }
};

/* ------------------------------ portal access ------------------------------ */

type Ctx = { params: Promise<{ id: string }> };

const publicUser = (u: PortalUser) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  status: u.status,
  lastLoginAt: u.lastLoginAt,
  inviteExpiresAt: u.inviteExpiresAt,
});

const customerFor = async (orgId: number, id: string) => {
  const db = await getDatabase();
  const customer = await db
    .getRepository(Customer)
    .findOne({ where: { id: parseInt(id), organizationId: orgId } });
  if (!customer) throw new HttpError("Customer not found", 404);
  return customer;
};

export const getCustomerPortalAccess = async (req: NextRequest, { params }: Ctx) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const customer = await customerFor(ctx.orgId, (await params).id);
    const db = await getDatabase();
    const users = await db
      .getRepository(PortalUser)
      .find({ where: { customerId: customer.id, organizationId: ctx.orgId }, order: { id: "ASC" } });
    return NextResponse.json({ users: users.map(publicUser) });
  } catch (error) {
    return errorResponse(error, "Failed to load portal access");
  }
};

/** POST { email, name? } — creates (or re-invites) a portal login and returns the invite link. */
export const inviteCustomerToPortal = async (req: NextRequest, { params }: Ctx) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const body = (await req.json()) as { email?: string; name?: string };
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!email) throw new HttpError("Email is required", 400);
    const emailError = validateEmail(email);
    if (emailError) throw new HttpError(emailError, 400);

    const customer = await customerFor(ctx.orgId, (await params).id);
    const db = await getDatabase();
    const repo = db.getRepository(PortalUser);
    let user = await repo.findOne({ where: { customerId: customer.id, email } });
    if (!user) {
      user = repo.create({
        email,
        customerId: customer.id,
        organizationId: ctx.orgId,
        status: "Invited",
      });
    }
    if (user.status === "Active") {
      throw new HttpError("This contact already has an active portal account.", 409);
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.status = "Invited";
    user.name = sanitizePlainText(String(body.name ?? "").trim()) || user.name || null;
    user.inviteTokenHash = hashToken(token);
    user.inviteExpiresAt = new Date(Date.now() + INVITE_TTL_MS);
    await repo.save(user);

    const link = `${req.nextUrl.origin}/portal/accept?token=${token}`;
    let emailed = false;
    try {
      const org = await db.getRepository(Organization).findOne({ where: { id: ctx.orgId } });
      const portalName =
        resolvePortalSettings(org?.portalSettings as Partial<PortalSettings> | null).portalName ||
        org?.name ||
        "your account";
      await createMailTransporter().sendMail({
        from: `"${getMailFromName(org?.name)}" <${getMailFromAddress()}>`,
        to: email,
        subject: `You're invited to ${portalName}`,
        html: `<p>Hello${user.name ? ` ${user.name}` : ""},</p>
<p>${org?.name || "We"} invited you to view your quotes, invoices and payments online.</p>
<p><a href="${link}">Set up your portal account</a></p>
<p>This link expires in 7 days.</p>`,
      });
      emailed = true;
    } catch {
      // Mail is optional: the invite link is returned so it can be shared manually.
    }
    return NextResponse.json({ user: publicUser(user), link, emailed }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to invite customer");
  }
};

/** DELETE ?userId= — disables a portal login (kept so it can be re-invited later). */
export const disableCustomerPortalUser = async (req: NextRequest, { params }: Ctx) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const customer = await customerFor(ctx.orgId, (await params).id);
    const userId = parseInt(req.nextUrl.searchParams.get("userId") || "");
    const db = await getDatabase();
    const result = await db.getRepository(PortalUser).update(
      { id: userId, customerId: customer.id, organizationId: ctx.orgId },
      { status: "Disabled", inviteTokenHash: null, inviteExpiresAt: null },
    );
    if (!result.affected) throw new HttpError("Portal user not found", 404);
    return NextResponse.json({ message: "Portal access removed" });
  } catch (error) {
    return errorResponse(error, "Failed to remove portal access");
  }
};
