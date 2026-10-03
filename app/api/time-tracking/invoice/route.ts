import { NextRequest } from "next/server";
import convertTimeEntriesToInvoice from "@/controllers/timeEntries/convertTimeEntriesToInvoice";

export const POST = async (req: NextRequest) => convertTimeEntriesToInvoice(req);
