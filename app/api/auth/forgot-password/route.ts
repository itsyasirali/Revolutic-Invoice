import { NextRequest } from "next/server";
import forgotPassword from "@/controllers/auth/forgotPassword";

export const POST = async (req: NextRequest) => {
  return forgotPassword(req);
};
