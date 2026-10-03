import { NextRequest } from "next/server";
import { billProject } from "@/controllers/projects/projects";

export const POST = async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
  billProject(req, ctx);
