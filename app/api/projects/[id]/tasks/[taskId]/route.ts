import { NextRequest } from "next/server";
import { updateTask, deleteTask } from "@/controllers/projects/projects";

type Ctx = { params: Promise<{ id: string; taskId: string }> };

export const PUT = async (req: NextRequest, ctx: Ctx) => updateTask(req, ctx);

export const PATCH = async (req: NextRequest, ctx: Ctx) => updateTask(req, ctx);

export const DELETE = async (req: NextRequest, ctx: Ctx) => deleteTask(req, ctx);
