import { NextRequest } from "next/server";
import { getTimeEntry } from "@/controllers/timeEntries/getTimeEntries";
import updateTimeEntry from "@/controllers/timeEntries/updateTimeEntry";
import { deleteTimeEntry } from "@/controllers/timeEntries/deleteTimeEntries";

type Ctx = { params: Promise<{ id: string }> };

export const GET = async (req: NextRequest, ctx: Ctx) => getTimeEntry(req, ctx);

export const PATCH = async (req: NextRequest, ctx: Ctx) => updateTimeEntry(req, ctx);

export const PUT = async (req: NextRequest, ctx: Ctx) => updateTimeEntry(req, ctx);

export const DELETE = async (req: NextRequest, ctx: Ctx) => deleteTimeEntry(req, ctx);
