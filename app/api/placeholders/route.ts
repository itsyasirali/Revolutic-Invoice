import { NextRequest } from "next/server";
import { listPlaceholders, createPlaceholder } from "@/controllers/placeholders/placeholders";

export async function GET(req: NextRequest) {
  return listPlaceholders(req);
}

export async function POST(req: NextRequest) {
  return createPlaceholder(req);
}
