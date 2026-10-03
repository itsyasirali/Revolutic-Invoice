import { NextRequest } from "next/server";
import batchDeleteExpenses from "@/controllers/expenses/batchDeleteExpenses";

export const DELETE = async (req: NextRequest) => batchDeleteExpenses(req);
