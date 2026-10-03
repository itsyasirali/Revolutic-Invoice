import { NextRequest } from "next/server";
import convertExpensesToInvoice from "@/controllers/expenses/convertExpensesToInvoice";

export const POST = async (req: NextRequest) => convertExpensesToInvoice(req);
