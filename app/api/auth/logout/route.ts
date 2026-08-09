import logout from "@/controllers/auth/logout";

export const POST = async () => {
  return logout();
};
