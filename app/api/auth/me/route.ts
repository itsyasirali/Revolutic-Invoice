import { NextRequest } from "next/server";
import getMe from "@/controllers/auth/getMe";

export const GET = async (req: NextRequest) => {
  return getMe(req);
};
