import { NextRequest } from "next/server";
import login from "@/controllers/auth/login";

export const POST = async (req: NextRequest) => {
  return login(req);
};
