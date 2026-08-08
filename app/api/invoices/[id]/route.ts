import { NextRequest } from "next/server";
import updateInvoice from "@/controllers/invoices/updateInvoice";
import deleteInvoice from "@/controllers/invoices/deleteInvoice";

export const PUT = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
  return updateInvoice(req, ctx);
};

export const DELETE = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
  return deleteInvoice(req, ctx);
};
