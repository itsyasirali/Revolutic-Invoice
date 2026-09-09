import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/session";

const logout = async () => {
  const response = NextResponse.json({ message: "Logged out" });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
};

export default logout;
