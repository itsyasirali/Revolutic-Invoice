import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Organization } from "@/entities/Organization";
import {
  getAuthUserId,
  getAuthOrgId,
  ACTIVE_ORG_COOKIE_NAME,
  TOKEN_MAX_AGE_SECONDS,
} from "@/lib/session";
import { OrganizationResponse } from "@/types/organization";

const getOrganization = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const orgRepo = db.getRepository(Organization);

    const organizations = await orgRepo.find({
      where: { userId },
      order: { createdAt: "ASC" },
    });

    if (!organizations || organizations.length === 0) {
      const responseBody: OrganizationResponse = {
        message: "No organization found",
        organization: null,
        organizations: [],
      };
      return NextResponse.json(responseBody, { status: 200 });
    }

    const activeOrgId = await getAuthOrgId(req);
    let organization = activeOrgId
      ? organizations.find((o) => o.id === activeOrgId) || null
      : null;

    if (!organization) {
      organization = organizations[0];
    }

    const responseBody: OrganizationResponse = {
      organization,
      organizations,
    };

    const response = NextResponse.json(responseBody);
    if (organization) {
      response.cookies.set({
        name: ACTIVE_ORG_COOKIE_NAME,
        value: String(organization.id),
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: TOKEN_MAX_AGE_SECONDS,
      });
    }

    return response;
  } catch (error: any) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { message: "Failed to fetch organization", error: error?.message },
      { status: 500 },
    );
  }
};

export default getOrganization;

