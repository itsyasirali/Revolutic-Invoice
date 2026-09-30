import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import { getAuthUserId } from "@/lib/session";
import { saveUploadedFile } from "@/lib/upload";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export const POST = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ message: "No image provided" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image files are allowed" },
        { status: 400 },
      );
    }
    if (file.size > MAX_AVATAR_BYTES) {
      return NextResponse.json(
        { message: "Image must be 2MB or smaller" },
        { status: 400 },
      );
    }

    const saved = await saveUploadedFile(file, req.url);
    if (!saved) {
      return NextResponse.json(
        { message: "Failed to upload image" },
        { status: 500 },
      );
    }

    const db = await getDatabase();
    await db.getRepository(User).update(userId, { image: saved.relativePath });

    return NextResponse.json({
      message: "Profile picture updated successfully",
      image: saved.relativePath,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { message: "Failed to upload image" },
      { status: 500 },
    );
  }
};
