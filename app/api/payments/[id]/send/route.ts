import { NextRequest } from "next/server";
import sendPayment from "@/controllers/payments/sendPayment";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return sendPayment(req, context);
}
