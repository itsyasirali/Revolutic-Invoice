import { NextRequest } from "next/server";
import otpRequest from "@/controllers/auth/otpRequest";

export const POST = async (req: NextRequest) => {
  return otpRequest(req);
};
