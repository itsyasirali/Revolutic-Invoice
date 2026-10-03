import { NextRequest } from "next/server";
import { getProject, updateProject, deleteProject } from "@/controllers/projects/projects";

type Ctx = { params: Promise<{ id: string }> };

export const GET = async (req: NextRequest, ctx: Ctx) => getProject(req, ctx);

export const PUT = async (req: NextRequest, ctx: Ctx) => updateProject(req, ctx);

export const PATCH = async (req: NextRequest, ctx: Ctx) => updateProject(req, ctx);

export const DELETE = async (req: NextRequest, ctx: Ctx) => deleteProject(req, ctx);
