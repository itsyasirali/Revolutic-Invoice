import { NextRequest } from "next/server";
import signup from "@/controllers/auth/signup";

export const POST = async (req: NextRequest) => {
  return signup(req);
};
