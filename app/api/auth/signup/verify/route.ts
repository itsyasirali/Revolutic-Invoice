import { NextRequest } from "next/server";
import signupVerify from "@/controllers/auth/signupVerify";

export const POST = async (req: NextRequest) => {
  return signupVerify(req);
};
