import { NextRequest } from "next/server";
import getExpense from "@/controllers/expenses/getExpense";
import updateExpense from "@/controllers/expenses/updateExpense";
import deleteExpense from "@/controllers/expenses/deleteExpense";

type Ctx = { params: Promise<{ id: string }> };

export const GET = async (req: NextRequest, ctx: Ctx) => getExpense(req, ctx);

export const PATCH = async (req: NextRequest, ctx: Ctx) => updateExpense(req, ctx);

export const PUT = async (req: NextRequest, ctx: Ctx) => updateExpense(req, ctx);

export const DELETE = async (req: NextRequest, ctx: Ctx) => deleteExpense(req, ctx);
