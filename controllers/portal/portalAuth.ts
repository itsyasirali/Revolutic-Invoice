import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getDatabase } from "@/lib/database";
import { PortalUser } from "@/entities/PortalUser";
import { Organization } from "@/entities/Organization";
import { Customer } from "@/entities/Customer";
import { errorResponse, HttpError } from "@/lib/requestContext";
import {
  PORTAL_COOKIE_NAME,
  assertLoginAllowed,
  clearLoginFailures,
  getPortalContext,
  hashToken,
  recordLoginFailure,
  setPortalCookie,
  signPortalToken,
} from "@/lib/portalSession";
import { resolvePortalSettings, type PortalMe, type PortalSettings } from "@/types/portal";

const MIN_PASSWORD = 8;

// Compared against when the email is unknown so response time does not reveal accounts.
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.ZpU8sGQ3vOj4rjBqkQXQ4Y3o8h1K";

const meFor = (ctx: Awaited<ReturnType<typeof getPortalContext>>): PortalMe | null => {
  if (ctx instanceof NextResponse) return null;
  const { portalUser, customer, organization, settings } = ctx;
  return {
    user: { id: portalUser.id, email: portalUser.email, name: portalUser.name },
    customer: {
      id: customer.id,
      displayName: customer.displayName,
      companyName: customer.companyName,
      currency: customer.currency,
      address: customer.address,
      contacts: customer.contacts || [],
    },
    organization: {
      id: organization.id,
      name: organization.name,
      logoUrl: organization.logoUrl,
      email: organization.email,
      phone: organization.phone,
    },
    settings,
  };
};

export const portalLogin = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!email || !password) throw new HttpError("Email and password are required", 400);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const throttleKey = `${ip}:${email}`;
    assertLoginAllowed(throttleKey);

    const db = await getDatabase();
    const candidates = await db
      .getRepository(PortalUser)
      .find({ where: { email, status: "Active" }, order: { id: "ASC" } });

    let matched: PortalUser | null = null;
    for (const candidate of candidates) {
      if (candidate.passwordHash && (await bcrypt.compare(password, candidate.passwordHash))) {
        matched = candidate;
        break;
      }
    }
    if (candidates.length === 0) await bcrypt.compare(password, DUMMY_HASH);
    if (!matched) {
      recordLoginFailure(throttleKey);
      throw new HttpError("Invalid email or password", 401);
    }
    clearLoginFailures(throttleKey);

    await db.getRepository(PortalUser).update({ id: matched.id }, { lastLoginAt: new Date() });
    const res = NextResponse.json({ message: "Signed in" });
    setPortalCookie(res, await signPortalToken(matched.id));
    return res;
  } catch (error) {
    return errorResponse(error, "Failed to sign in");
  }
};

export const portalLogout = async () => {
  const res = NextResponse.json({ message: "Signed out" });
  res.cookies.set({ name: PORTAL_COOKIE_NAME, value: "", path: "/", maxAge: 0 });
  return res;
};

export const portalMe = async (req: NextRequest) => {
  const ctx = await getPortalContext(req);
  if (ctx instanceof NextResponse) return ctx;
  return NextResponse.json(meFor(ctx));
};

/** Public: resolves an invite link so the set-password page can show who it is for. */
export const portalInviteInfo = async (req: NextRequest) => {
  try {
    const token = req.nextUrl.searchParams.get("token") || "";
    if (!token) throw new HttpError("Invitation token is required", 400);
    const db = await getDatabase();
    const user = await db
      .getRepository(PortalUser)
      .findOne({ where: { inviteTokenHash: hashToken(token) } });
    if (!user || !user.inviteExpiresAt || user.inviteExpiresAt < new Date() || user.status === "Disabled") {
      throw new HttpError("This invitation link is invalid or has expired.", 410);
    }
    const [org, customer] = await Promise.all([
      db.getRepository(Organization).findOne({ where: { id: user.organizationId } }),
      db.getRepository(Customer).findOne({ where: { id: user.customerId } }),
    ]);
    const settings = resolvePortalSettings(org?.portalSettings as Partial<PortalSettings> | null);
    return NextResponse.json({
      email: user.email,
      name: user.name,
      customerName: customer?.displayName,
      portalName: settings.portalName || org?.name,
    });
  } catch (error) {
    return errorResponse(error, "Failed to read invitation");
  }
};

export const portalAcceptInvite = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as { token?: string; password?: string; name?: string };
    const token = String(body.token ?? "");
    const password = String(body.password ?? "");
    if (!token) throw new HttpError("Invitation token is required", 400);
    if (password.length < MIN_PASSWORD) {
      throw new HttpError(`Password must be at least ${MIN_PASSWORD} characters`, 400);
    }
    const db = await getDatabase();
    const repo = db.getRepository(PortalUser);
    const user = await repo.findOne({ where: { inviteTokenHash: hashToken(token) } });
    if (!user || !user.inviteExpiresAt || user.inviteExpiresAt < new Date() || user.status === "Disabled") {
      throw new HttpError("This invitation link is invalid or has expired.", 410);
    }
    user.passwordHash = await bcrypt.hash(password, 10);
    user.status = "Active";
    user.inviteTokenHash = null;
    user.inviteExpiresAt = null;
    user.lastLoginAt = new Date();
    if (body.name !== undefined && String(body.name).trim()) user.name = String(body.name).trim();
    await repo.save(user);

    const res = NextResponse.json({ message: "Account activated" });
    setPortalCookie(res, await signPortalToken(user.id));
    return res;
  } catch (error) {
    return errorResponse(error, "Failed to accept invitation");
  }
};

export const portalChangePassword = async (req: NextRequest) => {
  const ctx = await getPortalContext(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const body = (await req.json()) as { currentPassword?: string; newPassword?: string };
    const next = String(body.newPassword ?? "");
    if (next.length < MIN_PASSWORD) {
      throw new HttpError(`Password must be at least ${MIN_PASSWORD} characters`, 400);
    }
    const hash = ctx.portalUser.passwordHash;
    if (!hash || !(await bcrypt.compare(String(body.currentPassword ?? ""), hash))) {
      throw new HttpError("Current password is incorrect", 400);
    }
    const db = await getDatabase();
    await db
      .getRepository(PortalUser)
      .update({ id: ctx.portalUser.id }, { passwordHash: await bcrypt.hash(next, 10) });
    return NextResponse.json({ message: "Password updated" });
  } catch (error) {
    return errorResponse(error, "Failed to change password");
  }
};
