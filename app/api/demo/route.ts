import { NextRequest } from "next/server";
import submitDemoRequest from "@/controllers/demo/submitDemoRequest";

export const POST = async (req: NextRequest) => {
  return submitDemoRequest(req);
};
