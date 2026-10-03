import { NextRequest } from "next/server";
import { getAllTimeEntries } from "@/controllers/timeEntries/getTimeEntries";
import createTimeEntry from "@/controllers/timeEntries/createTimeEntry";

export const GET = async (req: NextRequest) => getAllTimeEntries(req);

export const POST = async (req: NextRequest) => createTimeEntry(req);
