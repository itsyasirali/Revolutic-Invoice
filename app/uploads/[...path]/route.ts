import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import os from "os";
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
  const tmpUploadsRoot = path.join(os.tmpdir(), "uploads");

  const cwdPath = path.join(uploadsRoot, ...segments);
  const tmpPath = path.join(tmpUploadsRoot, ...segments);

  let targetPath: string | null = null;

  // Security: ensure segments don't escape root
  if (cwdPath.startsWith(uploadsRoot)) {
    try {
      const s = await stat(/*turbopackIgnore: true*/ cwdPath);
      if (s.isFile()) targetPath = cwdPath;
    } catch {
      // Ignore and check tmpPath
    }
  }

  if (!targetPath && tmpPath.startsWith(tmpUploadsRoot)) {
    try {
      const s = await stat(/*turbopackIgnore: true*/ tmpPath);
      if (s.isFile()) targetPath = tmpPath;
    } catch {
      // Not found
    }
  }

  if (!targetPath) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  try {
    const buffer = await readFile(/*turbopackIgnore: true*/ targetPath);
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
};

