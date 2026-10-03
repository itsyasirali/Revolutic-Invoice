import { NextRequest } from "next/server";
import { createTask } from "@/controllers/projects/projects";

export const POST = async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
  createTask(req, ctx);
