import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";

export interface RequestContext {
  userId: number;
  orgId: number;
}

/**
 * Resolves the authenticated user and active organization from the request
 * (never from the body). Returns a ready-to-send error response otherwise.
 */
export const getRequestContext = async (
  req: NextRequest,
): Promise<RequestContext | NextResponse> => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const orgId = await getAuthOrgId(req);
  if (!orgId) {
    return NextResponse.json(
      { message: "Active organization is required" },
      { status: 400 },
    );
  }
  return { userId, orgId };
};

export const errorResponse = (error: unknown, fallback: string) => {
  // HttpError and InvoiceOperationError both carry an HTTP status.
  const status = (error as { status?: unknown } | null)?.status;
  if (error instanceof Error && typeof status === "number") {
    return NextResponse.json({ message: error.message }, { status });
  }
  console.error(fallback, error);
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ message }, { status: 500 });
};

export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}
