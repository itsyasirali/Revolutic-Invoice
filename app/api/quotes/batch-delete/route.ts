import { NextRequest } from "next/server";
import { batchDeleteQuotes } from "@/controllers/quotes/deleteQuotes";

export const DELETE = async (req: NextRequest) => batchDeleteQuotes(req);
