import { NextRequest } from "next/server";
import getAllExpenses from "@/controllers/expenses/getAllExpenses";
import createExpense from "@/controllers/expenses/createExpense";

export const GET = async (req: NextRequest) => getAllExpenses(req);

export const POST = async (req: NextRequest) => createExpense(req);
