import { NextRequest } from "next/server";
import createOrganization from "@/controllers/organizations/createOrganization";
import getOrganization from "@/controllers/organizations/getOrganization";

export async function GET(req: NextRequest) {
  return getOrganization(req);
}

export async function POST(req: NextRequest) {
  return createOrganization(req);
}
