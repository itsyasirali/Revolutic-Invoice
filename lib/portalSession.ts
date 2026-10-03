import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";
import { getDatabase } from "@/lib/database";
import { getAuthSecret } from "@/lib/session";
import { PortalUser } from "@/entities/PortalUser";
import { PortalActivity } from "@/entities/PortalActivity";
import { Organization } from "@/entities/Organization";
import { Customer } from "@/entities/Customer";
import { HttpError } from "@/lib/requestContext";
import {
  ACTIVITY_NOTIFY_KEY,
  resolvePortalSettings,
  type PortalActivityType,
  type PortalPermission,
  type PortalSettings,
} from "@/types/portal";

export const PORTAL_COOKIE_NAME = "portal_token";
export const PORTAL_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

// Portal tokens are signed with a different key than application sessions, so a
// portal token can never be accepted as (or confused with) a business login.
const portalSecret = () => {
  const base = getAuthSecret();
  const suffix = new TextEncoder().encode(":customer-portal");
  const merged = new Uint8Array(base.length + suffix.length);
  merged.set(base);
  merged.set(suffix, base.length);
  return merged;
};

export const signPortalToken = (portalUserId: number) =>
  new SignJWT({ typ: "portal", pid: portalUserId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PORTAL_TOKEN_MAX_AGE_SECONDS}s`)
    .sign(portalSecret());

const verifyPortalToken = async (token: string): Promise<number | null> => {
  try {
    const { payload } = await jwtVerify(token, portalSecret());
    if (payload.typ !== "portal") return null;
    const pid = Number(payload.pid);
    return Number.isInteger(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
};

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const setPortalCookie = (res: NextResponse, token: string) =>
  res.cookies.set({
    name: PORTAL_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PORTAL_TOKEN_MAX_AGE_SECONDS,
  });

export interface PortalContext {
  portalUser: PortalUser;
  customerId: number;
  orgId: number;
  settings: PortalSettings;
  organization: Organization;
  customer: Customer;
}

/**
 * Resolves the signed-in portal customer. Every portal query must scope by the
 * returned customerId and orgId, never by anything sent in the request.
 */
export const getPortalContext = async (
  req: NextRequest,
): Promise<PortalContext | NextResponse> => {
  const unauthorized = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const token = req.cookies.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) return unauthorized;
  const pid = await verifyPortalToken(token);
  if (!pid) return unauthorized;

  const db = await getDatabase();
  const portalUser = await db.getRepository(PortalUser).findOne({ where: { id: pid } });
  if (!portalUser || portalUser.status !== "Active") return unauthorized;

  const [organization, customer] = await Promise.all([
    db.getRepository(Organization).findOne({ where: { id: portalUser.organizationId } }),
    db
      .getRepository(Customer)
      .findOne({ where: { id: portalUser.customerId, organizationId: portalUser.organizationId } }),
  ]);
  if (!organization || !customer || customer.status === "Inactive") return unauthorized;

  const settings = resolvePortalSettings(
    organization.portalSettings as Partial<PortalSettings> | null,
  );
  if (!settings.enabled) {
    return NextResponse.json(
      { message: "The customer portal is currently disabled." },
      { status: 403 },
    );
  }
  return {
    portalUser,
    customerId: customer.id,
    orgId: organization.id,
    settings,
    organization,
    customer,
  };
};

export const requirePermission = (ctx: PortalContext, permission: PortalPermission) => {
  if (!ctx.settings[permission]) {
    throw new HttpError("This section is not available for your account.", 403);
  }
};

/** Records a customer action as a business notification (respecting org notify settings). */
export const logPortalActivity = async (
  ctx: PortalContext,
  type: PortalActivityType,
  entityType: string | null,
  entityId: number | null,
  title: string,
) => {
  if (!ctx.settings.notify[ACTIVITY_NOTIFY_KEY[type]]) return;
  const db = await getDatabase();
  const repo = db.getRepository(PortalActivity);
  // "viewed" events are recorded once per entity per day, not on every page load.
  if (type === "invoice_viewed" || type === "quote_viewed") {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await repo
      .createQueryBuilder("a")
      .where(
        `a.organizationId = :org AND a.customerId = :cid AND a.type = :type
         AND a.entityId = :eid AND a.createdAt > :since`,
        { org: ctx.orgId, cid: ctx.customerId, type, eid: entityId, since },
      )
      .getCount();
    if (existing) return;
  }
  await repo.save(
    repo.create({
      organizationId: ctx.orgId,
      customerId: ctx.customerId,
      type,
      entityType,
      entityId,
      title,
    }),
  );
};

/** Invoices and quotes the customer may see (drafts are never exposed). */
export const PORTAL_INVOICE_STATUSES = ["Sent", "Partially Paid", "Paid", "Overdue", "Written Off"];
export const PORTAL_QUOTE_STATUSES = [
  "Sent",
  "Viewed",
  "Accepted",
  "Declined",
  "Expired",
  "Converted",
];

// Naive in-memory throttle for portal sign-in attempts (per server instance).
const attempts = new Map<string, { count: number; first: number }>();
export const assertLoginAllowed = (key: string) => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const entry = attempts.get(key);
  if (entry && now - entry.first < windowMs && entry.count >= 8) {
    throw new HttpError("Too many sign-in attempts. Please try again later.", 429);
  }
};
export const recordLoginFailure = (key: string) => {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first >= 15 * 60 * 1000) attempts.set(key, { count: 1, first: now });
  else entry.count++;
};
export const clearLoginFailures = (key: string) => attempts.delete(key);
