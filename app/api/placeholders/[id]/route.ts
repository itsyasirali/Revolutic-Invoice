import { NextRequest } from "next/server";
import { updatePlaceholder, deletePlaceholder } from "@/controllers/placeholders/placeholders";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return updatePlaceholder(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return deletePlaceholder(req, context);
}
