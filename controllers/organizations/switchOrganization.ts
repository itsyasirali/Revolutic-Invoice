import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Organization } from "@/entities/Organization";
import {
  getAuthUserId,
  getAuthToken,
  signAuthToken,
  AUTH_COOKIE_NAME,
  ACTIVE_ORG_COOKIE_NAME,
  TOKEN_MAX_AGE_SECONDS,
} from "@/lib/session";
import { SwitchOrganizationPayload } from "@/types/organization";

const switchOrganization = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: SwitchOrganizationPayload = await req.json();
    const { organizationId } = body;

    const parsedOrgId = parseInt(String(organizationId), 10);
    if (Number.isNaN(parsedOrgId) || parsedOrgId <= 0) {
      return NextResponse.json(
        { message: "Valid organization ID is required" },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const orgRepo = db.getRepository(Organization);

    // Verify the target organization belongs to the authenticated user
    const targetOrg = await orgRepo.findOne({
      where: { id: parsedOrgId, userId },
    });

    if (!targetOrg) {
      return NextResponse.json(
        { message: "Organization not found or access denied" },
        { status: 404 },
      );
    }

    // Re-issue JWT cookie with the switched organizationId
    const currentToken = await getAuthToken(req);
    const newPayload = {
      ...currentToken,
      organizationId: targetOrg.id,
      companyName: targetOrg.name,
    };
    const newToken = await signAuthToken(newPayload as any);

    const response = NextResponse.json(
      {
        message: "Organization switched successfully",
        organization: targetOrg,
      },
      { status: 200 },
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE_SECONDS,
    });

    response.cookies.set({
      name: ACTIVE_ORG_COOKIE_NAME,
      value: String(targetOrg.id),
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error: any) {
    console.error("Error switching organization:", error);
    return NextResponse.json(
      { message: "Failed to switch organization", error: error?.message },
      { status: 500 },
    );
  }
};

export default switchOrganization;
