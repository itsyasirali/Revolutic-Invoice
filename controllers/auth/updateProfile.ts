import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import { UpdateProfilePayload } from "@/types/auth";
import { getToken } from "next-auth/jwt";

const updateProfile = async (req: NextRequest) => {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const data = { user: token };
  const sessionUser = data.user;

  if (!sessionUser || !sessionUser.id) {
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    const body: UpdateProfilePayload = await req.json();

    const db = await getDatabase();
    const usersRepository = db.getRepository(User);

    const userId = parseInt(sessionUser.id as string, 10);
    const user = await usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401 },
      );
    }

    const updateData: Partial<User> = {};

    if (body.name && body.name.trim()) {
      updateData.name = body.name.trim();
    }

    if (
      body.email &&
      body.email.trim() &&
      body.email.toLowerCase() !== user.email.toLowerCase()
    ) {
      const existing = await usersRepository.findOne({
        where: { email: body.email.trim() },
      });
      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { message: "Email address is already in use by another account" },
          { status: 409 },
        );
      }
      updateData.email = body.email.trim();
    }

    if (body.newPassword) {
      if (body.currentPassword) {
        const isMatch = await bcrypt.compare(
          body.currentPassword,
          user.password,
        );
        if (!isMatch) {
          return NextResponse.json(
            { message: "Current password is incorrect" },
            { status: 400 },
          );
        }
      }
      updateData.password = await bcrypt.hash(body.newPassword, 10);
    }

    await usersRepository.update(userId, updateData);
    const updatedUser = await usersRepository.findOne({
      where: { id: userId },
    });
    if (!updatedUser) {
      throw new Error("User not found after update");
    }

    const newSessionUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
    };

    const successMessage = body.newPassword
      ? "Password updated successfully"
      : "Profile updated successfully";

    const response = NextResponse.json(
      { message: successMessage, user: newSessionUser },
      { status: 200 },
    );
    

    return response;
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 },
    );
  }
};

export default updateProfile;
