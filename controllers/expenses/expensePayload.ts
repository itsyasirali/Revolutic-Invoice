import { NextRequest } from "next/server";
import type { DataSource } from "typeorm";
import { Customer } from "@/entities/Customer";
import { ExpenseCategory } from "@/entities/ExpenseCategory";
import { extractFormFields, saveUploadedFile } from "@/lib/upload";
import { HttpError } from "@/lib/requestContext";

export interface ExpenseBody {
  expenseDate?: string;
  vendor?: string;
  customerId?: string | number | null;
  projectId?: string | number | null;
  categoryId?: string | number | null;
  categoryName?: string;
  description?: string;
  amount?: string | number;
  currency?: string;
  taxPercent?: string | number;
  paymentMethod?: string;
  referenceNumber?: string;
  billable?: string | boolean;
  notes?: string;
  removeAttachment?: string | boolean;
}

export const toBool = (v: unknown) => v === true || v === "true" || v === "1";

export const present = (v: unknown) =>
  v !== undefined && v !== null && v !== "" && v !== "null";

/** Accepts JSON or multipart/form-data (with an optional `attachment` file). */
export const readExpenseBody = async (
  req: NextRequest,
): Promise<{ body: ExpenseBody; attachmentUrl?: string }> => {
  const type = req.headers.get("content-type") || "";
  if (!type.includes("multipart/form-data")) {
    return { body: (await req.json()) as ExpenseBody };
  }
  const { fields, files } = extractFormFields(await req.formData(), "attachment");
  let attachmentUrl: string | undefined;
  if (files[0]) {
    const saved = await saveUploadedFile(files[0], req.url);
    if (!saved) throw new HttpError("Failed to upload attachment", 500);
    attachmentUrl = saved.relativePath;
  }
  return { body: fields as ExpenseBody, attachmentUrl };
};

export const assertCustomerInOrg = async (
  db: DataSource,
  customerId: number,
  orgId: number,
) => {
  const customer = await db
    .getRepository(Customer)
    .findOne({ where: { id: customerId, organizationId: orgId } });
  if (!customer) {
    throw new HttpError("Customer not found in this organization", 404);
  }
};

/** Resolves a category by id, or finds/creates one by name; always org-scoped. */
export const resolveCategoryId = async (
  db: DataSource,
  orgId: number,
  body: ExpenseBody,
): Promise<number | null | undefined> => {
  const repo = db.getRepository(ExpenseCategory);
  if (present(body.categoryId)) {
    const category = await repo.findOne({
      where: { id: Number(body.categoryId), organizationId: orgId },
    });
    if (!category) throw new HttpError("Category not found in this organization", 404);
    return category.id;
  }
  const name = String(body.categoryName ?? "").trim();
  if (name) {
    const existing = await repo
      .createQueryBuilder("c")
      .where("c.organizationId = :orgId AND LOWER(c.name) = LOWER(:name)", { orgId, name })
      .getOne();
    if (existing) return existing.id;
    return (await repo.save(repo.create({ name, organizationId: orgId }))).id;
  }
  if (body.categoryId === "" || body.categoryId === null) return null;
  return undefined;
};

export const parseDate = (value: unknown, label: string): Date => {
  const d = new Date(String(value));
  if (!value || isNaN(d.getTime())) throw new HttpError(`${label} is required`, 400);
  return d;
};
