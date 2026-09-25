import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Customer } from "@/entities/Customer";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";
import { extractFormFields, saveUploadedFile } from "@/lib/upload";
import {
  parseContactsFromBody,
  buildDocumentPaths,
  deleteFileIfExists,
  validateContacts,
} from "@/utils/customers/customersHelper";

const updateCustomer = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const orgId = await getAuthOrgId(req);
  if (!orgId) {
    return NextResponse.json(
      { message: "Active organization is required" },
      { status: 400 },
    );
  }

  try {
    const parsedId = parseInt(id, 10);
    const db = await getDatabase();
    const customersRepository = db.getRepository(Customer);

    const existingCustomer = await customersRepository.findOne({
      where: { id: parsedId, organizationId: orgId },
    });
    if (!existingCustomer) {
      return NextResponse.json(
        { message: "Customer not found in this organization" },
        { status: 404 },
      );
    }

    const formData = await req.formData();
    const { fields, files } = extractFormFields(formData, "documents");

    const customerType = fields.customerType;
    const companyName = fields.companyName;
    const displayName = fields.displayName;
    const currency = fields.currency;
    const address = fields.address;
    const remarks = fields.remarks;
    const status = fields.status;

    if (!customerType) {
      return NextResponse.json(
        { message: "Customer type is required" },
        { status: 400 },
      );
    }
    if (!displayName || String(displayName).trim().length === 0) {
      return NextResponse.json(
        { message: "Display Name is required" },
        { status: 400 },
      );
    }

    const contacts = parseContactsFromBody(fields) || [];
    const contactsError = validateContacts(contacts);
    if (contactsError) {
      return NextResponse.json({ message: contactsError }, { status: 400 });
    }

    let existingFilesFromClient: string[] = [];
    const rawExisting = fields.existingDocuments ?? fields.existingFiles;

    if (typeof rawExisting === "string") {
      try {
        existingFilesFromClient = JSON.parse(rawExisting);
      } catch {
        existingFilesFromClient = [];
      }
    }

    const savedFiles = files.length > 0
      ? await Promise.all(
          files.map((file) => saveUploadedFile(file, req.nextUrl.pathname)),
        )
      : [];
    const newDocumentPaths = buildDocumentPaths(savedFiles);
    const finalDocuments = [
      ...(existingFilesFromClient || []),
      ...newDocumentPaths,
    ];

    const prevDocs = existingCustomer.documents || [];
    const docsToDelete = prevDocs.filter((p) => !finalDocuments.includes(p));

    await Promise.all(
      docsToDelete.map((p) =>
        deleteFileIfExists(p).catch((e) =>
          console.error("Failed to delete removed customer document:", p, e),
        ),
      ),
    );

    existingCustomer.customerType = customerType ?? existingCustomer.customerType;
    existingCustomer.companyName = companyName ?? existingCustomer.companyName;
    existingCustomer.displayName = displayName ?? existingCustomer.displayName;
    existingCustomer.currency = currency ?? existingCustomer.currency;
    existingCustomer.address = address ?? existingCustomer.address;
    existingCustomer.remarks = remarks ?? existingCustomer.remarks;
    existingCustomer.status = status ?? existingCustomer.status ?? "Active";
    existingCustomer.documents = finalDocuments;
    existingCustomer.contacts = contacts;

    await customersRepository.save(existingCustomer);

    return NextResponse.json({
      message: "Customer updated",
      customer: existingCustomer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update customer";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 },
    );
  }
};

export default updateCustomer;
