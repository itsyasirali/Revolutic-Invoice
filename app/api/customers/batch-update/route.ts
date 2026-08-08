import { NextRequest } from "next/server";
import batchUpdateCustomers from "@/controllers/customers/batchUpdateCustomers";

export const PUT = async (req: NextRequest) => {
  return batchUpdateCustomers(req);
};
