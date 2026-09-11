import { NextRequest } from "next/server";
import getInvoice from "@/controllers/invoices/getInvoice";
import updateInvoice from "@/controllers/invoices/updateInvoice";
import deleteInvoice from "@/controllers/invoices/deleteInvoice";

export const GET = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
  return getInvoice(req, ctx);
};

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

