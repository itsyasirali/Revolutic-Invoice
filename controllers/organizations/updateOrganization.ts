import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Organization } from "@/entities/Organization";
import { getAuthUserId } from "@/lib/session";
import { sanitizePlainText } from "@/lib/sanitizeHtml";
import { validateEmail, validatePhone } from "@/lib/validation/contact";
import type { CreateOrganizationPayload } from "@/types/organization";

const updateOrganization = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const organizationId = parseInt(id, 10);
  if (isNaN(organizationId)) {
    return NextResponse.json({ message: "Invalid organization ID" }, { status: 400 });
  }

  try {
    const body: Partial<CreateOrganizationPayload> = await req.json();

    const db = await getDatabase();
    const orgRepo = db.getRepository(Organization);
    const org = await orgRepo.findOne({ where: { id: organizationId, userId } });
    if (!org) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    }

    if (body.name !== undefined) {
      const name = sanitizePlainText(String(body.name).trim());
      if (!name) {
        return NextResponse.json({ message: "Organization name is required" }, { status: 400 });
      }
      if (name !== org.name) {
        const duplicate = await orgRepo.findOne({ where: { userId, name } });
        if (duplicate && duplicate.id !== org.id) {
          return NextResponse.json(
            { message: "An organization with this name already exists in your account." },
            { status: 400 },
          );
        }
        org.name = name;
      }
    }

    const emailError = validateEmail(body.email);
    if (emailError) return NextResponse.json({ message: emailError }, { status: 400 });
    const phoneError = validatePhone(body.phone);
    if (phoneError) return NextResponse.json({ message: phoneError }, { status: 400 });

    const text = (v?: string) => sanitizePlainText(v || undefined) || null;
    if (body.industry !== undefined) org.industry = body.industry || null;
    if (body.businessLocation !== undefined) org.businessLocation = body.businessLocation || null;
    if (body.stateProvince !== undefined) org.stateProvince = text(body.stateProvince);
    if (body.streetAddress !== undefined) org.streetAddress = text(body.streetAddress);
    if (body.city !== undefined) org.city = text(body.city);
    if (body.zipCode !== undefined) org.zipCode = text(body.zipCode);
    if (body.address !== undefined) org.address = text(body.address);
    if (body.currency) org.currency = body.currency;
    if (body.language) org.language = body.language;
    if (body.timeZone) org.timeZone = body.timeZone;
    if (body.email !== undefined) org.email = body.email || null;
    if (body.phone !== undefined) org.phone = body.phone || null;
    if (body.website !== undefined) org.website = body.website || null;

    const saved = await orgRepo.save(org);
    return NextResponse.json({ message: "Organization updated successfully", organization: saved });
  } catch (error: any) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { message: "Failed to update organization", error: error?.message },
      { status: 500 },
    );
  }
};

export default updateOrganization;
