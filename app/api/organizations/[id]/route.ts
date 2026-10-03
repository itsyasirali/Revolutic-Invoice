import { NextRequest } from "next/server";
import updateOrganization from "@/controllers/organizations/updateOrganization";
import deleteOrganization from "@/controllers/organizations/deleteOrganization";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return deleteOrganization(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return updateOrganization(req, context);
}
