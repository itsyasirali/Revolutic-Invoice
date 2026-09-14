import { NextRequest } from "next/server";
import switchOrganization from "@/controllers/organizations/switchOrganization";

export const POST = async (req: NextRequest) => {
  return switchOrganization(req);
};
