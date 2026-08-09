import { NextResponse } from "next/server";

const logout = async () => {
  return NextResponse.json({ message: "Logged out" });
};

export default logout;
