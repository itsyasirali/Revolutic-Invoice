import { NextRequest } from "next/server";
import otpVerify from "@/controllers/auth/otpVerify";

export const POST = async (req: NextRequest) => {
  return otpVerify(req);
};
