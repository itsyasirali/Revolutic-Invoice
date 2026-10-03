import { NextRequest } from "next/server";
import { disableCustomerPortalUser, getCustomerPortalAccess, inviteCustomerToPortal } from "@/controllers/portal/portalAdmin";

type Ctx = { params: Promise<{ id: string }> };

export const GET = async (req: NextRequest, ctx: Ctx) => getCustomerPortalAccess(req, ctx);

export const POST = async (req: NextRequest, ctx: Ctx) => inviteCustomerToPortal(req, ctx);

export const DELETE = async (req: NextRequest, ctx: Ctx) => disableCustomerPortalUser(req, ctx);
