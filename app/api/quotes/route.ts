import { NextRequest } from "next/server";
import { getAllQuotes } from "@/controllers/quotes/getQuotes";
import createQuote from "@/controllers/quotes/createQuote";

export const GET = async (req: NextRequest) => getAllQuotes(req);

export const POST = async (req: NextRequest) => createQuote(req);
