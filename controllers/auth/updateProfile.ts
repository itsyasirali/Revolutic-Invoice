import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import { UpdateProfilePayload } from "@/types/auth";
import { getAuthUserId } from "@/lib/session";
import { validatePassword } from "@/lib/validation/password";
import { isValidEmail } from "@/lib/validation/email";

const updateProfile = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);

  if (!userId) {
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    const body: UpdateProfilePayload = await req.json();

    const db = await getDatabase();
    const usersRepository = db.getRepository(User);

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

    if (body.email !== undefined && !isValidEmail(body.email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    if (body.name && body.name.trim()) {
      const fullName = body.name.trim();
      const [first, ...rest] = fullName.split(/\s+/);
      updateData.name = fullName;
      updateData.firstName = first;
      updateData.lastName = rest.join(" ");
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
      const passwordError = validatePassword(body.newPassword);
      if (passwordError) {
        return NextResponse.json({ message: passwordError }, { status: 400 });
      }
      if (!body.currentPassword) {
        return NextResponse.json(
          { message: "Current password is required to set a new password" },
          { status: 400 },
        );
      }
      const isMatch = await bcrypt.compare(
        body.currentPassword,
        user.password || "",
      );
      if (!isMatch) {
        return NextResponse.json(
          { message: "Current password is incorrect" },
          { status: 400 },
        );
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
      image: updatedUser.image ?? null,
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
