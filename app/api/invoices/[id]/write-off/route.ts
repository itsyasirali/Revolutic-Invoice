import { NextRequest } from "next/server";
import writeOffInvoice from "@/controllers/invoices/writeOffInvoice";

export const POST = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
  return writeOffInvoice(req, ctx);
};
