import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Template } from "@/entities/Template";
import { getAuthUserId } from "@/lib/session";
import { sanitizeTemplateFields } from "@/utils/templates/sanitizeTemplateFields";
import { uploadFileToCloudinary, deleteCloudinaryAsset } from "@/lib/cloudinary";

const parseFields = async (req: NextRequest) => {
  const contentType = req.headers.get("content-type") || "";
  let fields: Record<string, unknown> = {};
  let logoUrl: string | undefined = undefined;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    for (const [key, value] of formData.entries()) {
      if (key === "logo" && value instanceof File && value.size > 0) {
        try {
          const isCloudinaryConfigured =
            Boolean(process.env.CLOUDINARY_URL) ||
            Boolean(
              process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_API_KEY &&
                process.env.CLOUDINARY_API_SECRET,
            );

          if (isCloudinaryConfigured) {
            const uploadResult = await uploadFileToCloudinary(value, "templates");
            logoUrl = uploadResult.url;
          } else {
            const bytes = await value.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const mime = value.type || "image/png";
            logoUrl = `data:${mime};base64,${buffer.toString("base64")}`;
          }
        } catch (uploadErr) {
          console.error("[Template] Logo upload to Cloudinary failed:", uploadErr);
        }
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

const updateTemplate = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const parsedUserId = userId;
    const templateId = parseInt(id, 10);

    if (isNaN(templateId)) {
      return NextResponse.json(
        { message: "Invalid template ID" },
        { status: 400 },
      );
    }

    const rawFields = await parseFields(req);
    const fields = sanitizeTemplateFields(rawFields);

    const db = await getDatabase();
    const templateRepo = db.getRepository(Template);

    const template = await templateRepo.findOne({
      where: { id: templateId, userId: parsedUserId },
    });

    if (!template) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 },
      );
    }

    // If logo was updated, remove old logo from Cloudinary if it was remote
    if (fields.logoUrl && template.logoUrl && template.logoUrl !== fields.logoUrl) {
      if (template.logoUrl.includes("cloudinary.com")) {
        deleteCloudinaryAsset(template.logoUrl).catch((e) =>
          console.warn("[Template] Could not delete previous logo asset:", e),
        );
      }
    }

    if (fields.isDefault) {
      await templateRepo.update({ userId: parsedUserId }, { isDefault: false });
    }

    Object.assign(template, fields);
    const updatedTemplate = await templateRepo.save(template);

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { message: (error as Error)?.message || "Failed to update template" },
      { status: 500 },
    );
  }
};

export default updateTemplate;
