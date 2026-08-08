import { NextRequest } from "next/server";
import getPayment from "@/controllers/payments/getPayment";
import updatePayment from "@/controllers/payments/updatePayment";
import deletePayment from "@/controllers/payments/deletePayment";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return getPayment(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return updatePayment(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return deletePayment(req, context);
}
