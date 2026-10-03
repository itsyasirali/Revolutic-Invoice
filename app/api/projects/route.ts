import { NextRequest } from "next/server";
import { getAllProjects, createProject } from "@/controllers/projects/projects";

export const GET = async (req: NextRequest) => getAllProjects(req);

export const POST = async (req: NextRequest) => createProject(req);
