import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { CustomPlaceholder } from "@/entities/CustomPlaceholder";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";
import { validateCustomKey } from "@/lib/placeholders/registry";

const MAX_VALUE = 2000;

const auth = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  const orgId = await getAuthOrgId(req);
  if (!orgId) {
    return {
      error: NextResponse.json(
        { message: "Active organization is required" },
        { status: 400 },
      ),
    };
  }
  return { orgId };
};

const validateBody = (body: any, requireKey: boolean): string | null => {
  if (requireKey) {
    const err = validateCustomKey(String(body?.key ?? ""));
    if (err) return err;
  }
  const value = String(body?.value ?? "");
  if (!value.trim()) return "Value is required";
  if (value.length > MAX_VALUE) return `Value must be at most ${MAX_VALUE} characters`;
  return null;
};

export const listPlaceholders = async (req: NextRequest) => {
  const a = await auth(req);
  if (a.error) return a.error;
  const db = await getDatabase();
  const rows = await db.getRepository(CustomPlaceholder).find({
    where: { organizationId: a.orgId },
    order: { key: "ASC" },
  });
  return NextResponse.json(rows);
};

export const createPlaceholder = async (req: NextRequest) => {
  const a = await auth(req);
  if (a.error) return a.error;
  try {
    const body = await req.json();
    const err = validateBody(body, true);
    if (err) return NextResponse.json({ message: err }, { status: 400 });

    const repo = (await getDatabase()).getRepository(CustomPlaceholder);
    const key = String(body.key);
    const exists = await repo
      .createQueryBuilder("p")
      .where("p.organizationId = :o AND LOWER(p.key) = LOWER(:k)", { o: a.orgId, k: key })
      .getCount();
    if (exists) {
      return NextResponse.json({ message: "A placeholder with this key already exists" }, { status: 409 });
    }
    const saved = await repo.save(
      repo.create({
        organizationId: a.orgId,
        key,
        label: String(body.label ?? "").slice(0, 100),
        value: String(body.value),
      }),
    );
    return NextResponse.json(saved, { status: 201 });
  } catch (e) {
    console.error("Error creating placeholder:", e);
    return NextResponse.json({ message: "Failed to create placeholder" }, { status: 500 });
  }
};

export const updatePlaceholder = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const a = await auth(req);
  if (a.error) return a.error;
  try {
    const { id } = await params;
    const body = await req.json();
    const err = validateBody(body, false);
    if (err) return NextResponse.json({ message: err }, { status: 400 });

    const repo = (await getDatabase()).getRepository(CustomPlaceholder);
    const row = await repo.findOne({ where: { id: Number(id), organizationId: a.orgId } });
    if (!row) return NextResponse.json({ message: "Not found" }, { status: 404 });

    row.value = String(body.value);
    if (body.label !== undefined) row.label = String(body.label).slice(0, 100);
    return NextResponse.json(await repo.save(row));
  } catch (e) {
    console.error("Error updating placeholder:", e);
    return NextResponse.json({ message: "Failed to update placeholder" }, { status: 500 });
  }
};

export const deletePlaceholder = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const a = await auth(req);
  if (a.error) return a.error;
  try {
    const { id } = await params;
    const repo = (await getDatabase()).getRepository(CustomPlaceholder);
    const row = await repo.findOne({ where: { id: Number(id), organizationId: a.orgId } });
    if (!row) return NextResponse.json({ message: "Not found" }, { status: 404 });
    await repo.remove(row);
    return NextResponse.json({ message: "Deleted" });
  } catch (e) {
    console.error("Error deleting placeholder:", e);
    return NextResponse.json({ message: "Failed to delete placeholder" }, { status: 500 });
  }
};
