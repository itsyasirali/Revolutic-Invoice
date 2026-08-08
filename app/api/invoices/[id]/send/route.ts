import { NextRequest } from "next/server";
import sendInvoice from "@/controllers/invoices/sendInvoice";

export const POST = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
  return sendInvoice(req, ctx);
};
