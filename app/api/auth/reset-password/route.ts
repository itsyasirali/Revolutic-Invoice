import { NextRequest } from "next/server";
import resetPassword from "@/controllers/auth/resetPassword";

export const POST = async (req: NextRequest) => {
  return resetPassword(req);
};
