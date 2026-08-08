import { NextRequest } from "next/server";
import getAllTemplates from "@/controllers/templates/getAllTemplates";
import createTemplate from "@/controllers/templates/createTemplate";

export async function GET(req: NextRequest) {
  return getAllTemplates(req);
}

export async function POST(req: NextRequest) {
  return createTemplate(req);
}
