import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getDatabase } from "@/lib/database";
import { Customer } from "@/entities/Customer";
import { getToken } from "next-auth/jwt";
import { extractFormFields, saveUploadedFile } from "@/lib/upload";
import {
  parseContactsFromBody,
  buildDocumentPaths,
  deleteFileIfExists,
} from "@/utils/customers/customersHelper";

const updateCustomer = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  try {
    const parsedId = parseInt(id);

    const db = await getDatabase();
    const customersRepository = db.getRepository(Customer);

    const existingCustomer = await customersRepository.findOne({
      where: { id: parsedId },
    });
    if (!existingCustomer) {
      return NextResponse.json(
        { message: "Customer not found" },
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

    let existingFilesFromClient: string[] = [];
    const rawExisting = fields.existingDocuments ?? fields.existingFiles;

    if (typeof rawExisting === "string") {
      try {
        existingFilesFromClient = JSON.parse(rawExisting);
      } catch {
        existingFilesFromClient = [];
      }
    }

    const savedFiles = await Promise.all(
      files.map((file) => saveUploadedFile(file, req.nextUrl.pathname)),
    );
    const newDocumentPaths = buildDocumentPaths(savedFiles);
    const finalDocuments = [
      ...(existingFilesFromClient || []),
      ...newDocumentPaths,
    ];

    const prevDocs = existingCustomer.documents || [];
    const docsToDelete = prevDocs.filter((p) => !finalDocuments.includes(p));

    docsToDelete.forEach((p) => {
      try {
        const absolute = path.resolve(p);
        if (absolute.startsWith(path.resolve("uploads", "customer"))) {
          deleteFileIfExists(p);
        }
      } catch (e) {
        console.error("Failed to delete file:", p, e);
      }
    });

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
    return NextResponse.json(
      { message: "Failed to update customer" },
      { status: 500 },
    );
  }
};

export default updateCustomer;
