import { NextRequest } from "next/server";
import {
  listExpenseCategories,
  createExpenseCategory,
} from "@/controllers/expenses/expenseCategories";

export const GET = async (req: NextRequest) => listExpenseCategories(req);

export const POST = async (req: NextRequest) => createExpenseCategory(req);
