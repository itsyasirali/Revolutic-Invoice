import { NextRequest } from "next/server";
import { getQuote } from "@/controllers/quotes/getQuotes";
import updateQuote from "@/controllers/quotes/updateQuote";
import { deleteQuote } from "@/controllers/quotes/deleteQuotes";

type Ctx = { params: Promise<{ id: string }> };

export const GET = async (req: NextRequest, ctx: Ctx) => getQuote(req, ctx);

export const PATCH = async (req: NextRequest, ctx: Ctx) => updateQuote(req, ctx);

export const PUT = async (req: NextRequest, ctx: Ctx) => updateQuote(req, ctx);

export const DELETE = async (req: NextRequest, ctx: Ctx) => deleteQuote(req, ctx);
