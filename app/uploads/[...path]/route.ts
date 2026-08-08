import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

// Replaces api/src/main.ts's app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' })
// — Next.js Route Handlers have no built-in equivalent for serving an
// arbitrary disk directory, so this streams the file back manually while
// preserving the exact `/uploads/<folder>/<file>` URL contract.

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) => {
  const { path: segments } = await params;
  const uploadsRoot = path.join(process.cwd(), "uploads");
  const resolvedPath = path.join(uploadsRoot, ...segments);

  if (!resolvedPath.startsWith(uploadsRoot)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  try {
    const fileStat = await stat(resolvedPath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const buffer = await readFile(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
};
