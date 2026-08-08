import { NextRequest } from "next/server";
import getAllCustomers from "@/controllers/customers/getAllCustomers";
import createCustomer from "@/controllers/customers/createCustomer";

export const GET = async (req: NextRequest) => {
  return getAllCustomers(req);
};

export const POST = async (req: NextRequest) => {
  return createCustomer(req);
};
