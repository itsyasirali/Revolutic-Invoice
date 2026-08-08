import { NextRequest } from "next/server";
import getTemplate from "@/controllers/templates/getTemplate";
import updateTemplate from "@/controllers/templates/updateTemplate";
import deleteTemplate from "@/controllers/templates/deleteTemplate";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return getTemplate(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return updateTemplate(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return deleteTemplate(req, context);
}
