import { NextRequest } from "next/server";
import logout from "@/controllers/auth/logout";

export const POST = async (req: NextRequest) => {
  return logout(req);
};
