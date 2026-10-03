import { NextRequest } from "next/server";
import { batchDeleteTimeEntries } from "@/controllers/timeEntries/deleteTimeEntries";

export const DELETE = async (req: NextRequest) => batchDeleteTimeEntries(req);
