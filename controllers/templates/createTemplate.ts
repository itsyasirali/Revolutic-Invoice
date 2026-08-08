import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Template } from "@/entities/Template";
import { readSession } from "@/lib/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const parseFields = async (req: NextRequest) => {
  const contentType = req.headers.get("content-type") || "";
  let fields: Record<string, unknown> = {};
  let logoUrl: string | undefined = undefined;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    for (const [key, value] of formData.entries()) {
      if (key === "logo" && value instanceof File && value.size > 0) {
        const bytes = await value.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        const ext = path.extname(value.name) || ".png";
        const fileName = `logo-${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        logoUrl = `/uploads/${fileName}`;
      } else if (typeof value === "string") {
        try {
          fields[key] = JSON.parse(value);
        } catch {
          fields[key] = value;
        }
      }
    }
  } else {
    fields = await req.json();
  }

  if (logoUrl) {
    fields.logoUrl = logoUrl;
  }

  return fields;
};

const createTemplate = async (req: NextRequest) => {
  const { data } = await readSession(req);
  const userId = data.user?.id;

  try {
    const parsedUserId = parseInt(String(userId));
    const fields = await parseFields(req);

    const db = await getDatabase();
    const templateRepo = db.getRepository(Template);

    if (fields.isDefault) {
      await templateRepo.update({ userId: parsedUserId }, { isDefault: false });
    }

    const newTemplate = templateRepo.create({
      ...fields,
      userId: parsedUserId,
      templateName: fields.templateName || "Custom Template",
    } as unknown as Template);

    const savedTemplate = await templateRepo.save(newTemplate);

    return NextResponse.json(savedTemplate, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { message: "Failed to create template" },
      { status: 500 }
    );
  }
};

export default createTemplate;
