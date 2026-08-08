import { NextRequest } from "next/server";
import updateCustomer from "@/controllers/customers/updateCustomer";

export const PUT = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
  return updateCustomer(req, ctx);
};
