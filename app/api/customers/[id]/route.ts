import { NextRequest } from "next/server";
import updateCustomer from "@/controllers/customers/updateCustomer";
import deleteCustomer from "@/controllers/customers/deleteCustomer";

export const PUT = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
  return updateCustomer(req, ctx);
};

export const DELETE = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
  return deleteCustomer(req, ctx);
};
