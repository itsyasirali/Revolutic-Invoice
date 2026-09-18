import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Organization } from "@/entities/Organization";
import { Template } from "@/entities/Template";
import { Customer } from "@/entities/Customer";
import { Invoice } from "@/entities/Invoice";
import { Item } from "@/entities/Item";
import { Payment } from "@/entities/Payment";
import {
  getAuthUserId,
  getAuthToken,
  signAuthToken,
  AUTH_COOKIE_NAME,
  ACTIVE_ORG_COOKIE_NAME,
  ACTIVE_ORG_SLUG_COOKIE_NAME,
  TOKEN_MAX_AGE_SECONDS,
} from "@/lib/session";

const deleteOrganization = async (
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
    return NextResponse.json(
      { message: "Invalid organization ID" },
      { status: 400 },
    );
  }

  try {
    const db = await getDatabase();
    const orgRepo = db.getRepository(Organization);

    const targetOrg = await orgRepo.findOne({
      where: { id: organizationId, userId },
    });

    if (!targetOrg) {
      return NextResponse.json(
        { message: "Organization not found or access denied" },
        { status: 404 },
      );
    }

    const allUserOrgs = await orgRepo.find({
      where: { userId },
      order: { createdAt: "ASC" },
    });

    if (allUserOrgs.length <= 1) {
      return NextResponse.json(
        { message: "You must have at least one organization. Create another organization before deleting this one." },
        { status: 400 },
      );
    }

    const customerRepo = db.getRepository(Customer);
    const invoiceRepo = db.getRepository(Invoice);
    const itemRepo = db.getRepository(Item);
    const paymentRepo = db.getRepository(Payment);

    const checkFilter = { organizationId };

    const [customerCount, invoiceCount, itemCount, paymentCount] =
      await Promise.all([
        customerRepo.count({ where: checkFilter }),
        invoiceRepo.count({ where: checkFilter }),
        itemRepo.count({ where: checkFilter }),
        paymentRepo.count({ where: checkFilter }),
      ]);

    const dataCount = customerCount + invoiceCount + itemCount + paymentCount;

    if (dataCount > 0) {
      return NextResponse.json(
        {
          message:
            "Cannot delete organization: it still has customers, invoices, items, or payments. Please delete them first.",
        },
        { status: 400 },
      );
    }

    const templateRepo = db.getRepository(Template);
    await templateRepo.delete({ organizationId });
    await orgRepo.delete({ id: organizationId, userId });

    const remainingOrgs = allUserOrgs.filter((o) => o.id !== organizationId);
    const nextOrg = remainingOrgs[0];

    const response = NextResponse.json(
      { message: "Organization deleted successfully" },
      { status: 200 },
    );

    const currentToken = await getAuthToken(req);
    const wasActiveOrg = currentToken?.organizationId === organizationId;

    if (wasActiveOrg && nextOrg) {
      const newPayload = {
        ...currentToken,
        organizationId: nextOrg.id,
        companyName: nextOrg.name,
      };
      const newToken = await signAuthToken(newPayload as any);

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
        value: String(nextOrg.id),
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: TOKEN_MAX_AGE_SECONDS,
      });

      if (nextOrg.slug) {
        response.cookies.set({
          name: ACTIVE_ORG_SLUG_COOKIE_NAME,
          value: nextOrg.slug,
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: TOKEN_MAX_AGE_SECONDS,
        });
      }
    }

    return response;
  } catch (error: any) {
    console.error("Error deleting organization:", error);
    const message =
      error?.detail || error?.message || "Failed to delete organization";
    return NextResponse.json(
      { message, error: String(error) },
      { status: 500 },
    );
  }
};

export default deleteOrganization;
