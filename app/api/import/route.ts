import { NextRequest, NextResponse } from "next/server";
import { getRequestContext, errorResponse } from "@/lib/requestContext";
import { commitDrafts, ImportValidationError } from "@/lib/services/zohoImport";
import { buildDrafts, ImportFormatError, type ImportFiles } from "@/lib/import/zohoMapper";
import type { ImportDrafts } from "@/lib/import/types";

const FIELDS: (keyof ImportFiles)[] = ["contacts", "items", "projects", "quotes", "invoices", "payments"];

/**
 * Two modes:
 *  - multipart with CSV file(s): maps them to editable drafts and returns a
 *    dry-run preview (nothing is saved).
 *  - JSON { drafts, dryRun }: validates (dryRun) or saves the user-edited drafts.
 */
export const POST = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    let drafts: ImportDrafts;
    let dryRun: boolean;
    let returnDrafts = false;

    if ((req.headers.get("content-type") || "").includes("application/json")) {
      const body = (await req.json()) as { drafts?: ImportDrafts; dryRun?: boolean };
      if (!body.drafts) {
        return NextResponse.json({ message: "No records to import" }, { status: 400 });
      }
      drafts = body.drafts;
      dryRun = body.dryRun === true;
    } else {
      const form = await req.formData();
      const files: ImportFiles = {};
      for (const field of FIELDS) {
        const file = form.get(field);
        if (file instanceof File && file.size > 0) files[field] = await file.text();
      }
      if (Object.keys(files).length === 0) {
        return NextResponse.json({ message: "Select at least one CSV file to import" }, { status: 400 });
      }
      drafts = buildDrafts(files);
      dryRun = form.get("dryRun") !== "false";
      returnDrafts = true;
    }

    const result = await commitDrafts(ctx.userId, ctx.orgId, drafts, dryRun);
    return NextResponse.json(
      {
        message: dryRun ? "Preview ready" : "Import completed",
        dryRun,
        ...result,
        ...(returnDrafts ? { drafts } : {}),
      },
      { status: dryRun ? 200 : 201 },
    );
  } catch (error) {
    if (error instanceof ImportFormatError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (error instanceof ImportValidationError) {
      return NextResponse.json({ message: error.message, errors: error.errors }, { status: 422 });
    }
    return errorResponse(error, "Failed to import data");
  }
};
