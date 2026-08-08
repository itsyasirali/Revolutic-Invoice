import { NextRequest } from "next/server";
import updateProfile from "@/controllers/auth/updateProfile";

export const PUT = async (req: NextRequest) => {
  return updateProfile(req);
};

export const POST = async (req: NextRequest) => {
  return updateProfile(req);
};
