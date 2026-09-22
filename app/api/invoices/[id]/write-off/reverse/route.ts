import { NextRequest } from "next/server";
import reverseWriteOff from "@/controllers/invoices/reverseWriteOff";

export const POST = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => {
  return reverseWriteOff(req, ctx);
};
