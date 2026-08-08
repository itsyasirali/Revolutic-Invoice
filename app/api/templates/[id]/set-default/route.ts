import { NextRequest } from "next/server";
import setDefaultTemplate from "@/controllers/templates/setDefaultTemplate";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return setDefaultTemplate(req, context);
}
