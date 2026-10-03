import { NextRequest } from "next/server";
import { createProjectFromQuote } from "@/controllers/projects/projects";

export const POST = async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
  createProjectFromQuote(req, ctx);
