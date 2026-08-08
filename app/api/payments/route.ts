import { NextRequest } from "next/server";
import getAllPayments from "@/controllers/payments/getAllPayments";
import createPayment from "@/controllers/payments/createPayment";

export async function GET(req: NextRequest) {
  return getAllPayments(req);
}

export async function POST(req: NextRequest) {
  return createPayment(req);
}
