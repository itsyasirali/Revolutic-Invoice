import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Organization } from "@/entities/Organization";
import { Template } from "@/entities/Template";
import { getAuthUserId, getAuthToken, signAuthToken, AUTH_COOKIE_NAME, TOKEN_MAX_AGE_SECONDS } from "@/lib/session";

const createOrganization = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name } = body;

    if (!name || String(name).trim().length === 0) {
      return NextResponse.json(
        { message: "Organization name is required" },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const orgRepo = db.getRepository(Organization);
    const templateRepo = db.getRepository(Template);

    // Prevent duplicate orgs for the same user
    const existing = await orgRepo.findOne({ where: { userId } });
    if (existing) {
      return NextResponse.json(
        { message: "Organization already exists", organization: existing },
        { status: 200 },
      );
    }

    // Create the organization
    const org = orgRepo.create({
      name: String(name).trim(),
      userId,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      currency: body.currency || "PKR",
      logoUrl: body.logoUrl || null,
      website: body.website || null,
    });
    const savedOrg = await orgRepo.save(org);

    // Create default template scoped to this org
    const defaultTemplate = templateRepo.create({
      userId,
      organizationId: savedOrg.id,
      templateName: "Standard Template",
      isDefault: true,
      margins: { top: 0.7, bottom: 0.7, left: 0.55, right: 0.4 },
      fontSize: 8,
      labelFontSize: 8,
    });
    await templateRepo.save(defaultTemplate);

    // Re-issue the JWT cookie with the new organizationId embedded
    const currentToken = await getAuthToken(req);
    const newPayload = {
      ...currentToken,
      organizationId: savedOrg.id,
    };
    const newToken = await signAuthToken(newPayload as any);

    const response = NextResponse.json(
      { message: "Organization created successfully", organization: savedOrg },
      { status: 201 },
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

    return response;
  } catch (error: any) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { message: "Failed to create organization", error: error?.message },
      { status: 500 },
    );
  }
};

export default createOrganization;
