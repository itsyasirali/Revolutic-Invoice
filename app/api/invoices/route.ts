import { NextRequest } from "next/server";
import getAllInvoices from "@/controllers/invoices/getAllInvoices";
import createInvoice from "@/controllers/invoices/createInvoice";

export const GET = async (req: NextRequest) => {
  return getAllInvoices(req);
};

export const POST = async (req: NextRequest) => {
  return createInvoice(req);
};
