import checkDbHealth from "@/controllers/health/checkDbHealth";

export const dynamic = "force-dynamic";

export const GET = async () => {
  return checkDbHealth();
};
