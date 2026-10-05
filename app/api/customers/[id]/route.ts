import { NextRequest } from "next/server";
import getCustomer from "@/controllers/customers/getCustomer";
import updateCustomer from "@/controllers/customers/updateCustomer";
import deleteCustomer from "@/controllers/customers/deleteCustomer";

export const GET = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
  return getCustomer(req, ctx);
};

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
