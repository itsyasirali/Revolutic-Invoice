import { NextRequest } from "next/server";
import deleteOrganization from "@/controllers/organizations/deleteOrganization";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return deleteOrganization(req, context);
}
