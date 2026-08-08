import { NextRequest } from "next/server";
import batchDeleteCustomers from "@/controllers/customers/batchDeleteCustomers";

export const DELETE = async (req: NextRequest) => {
  return batchDeleteCustomers(req);
};
