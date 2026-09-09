import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Customer } from "@/entities/Customer";
import { getAuthUserId } from "@/lib/session";
import { extractFormFields, saveUploadedFile } from "@/lib/upload";
import {
  parseContactsFromBody,
  buildDocumentPaths,
} from "@/utils/customers/customersHelper";

const createCustomer = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const { fields, files } = extractFormFields(formData, "documents");

    const customerType = fields.customerType;
    const companyName = fields.companyName;
    const displayName = fields.displayName;
    const currency = fields.currency || "USD";
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
    const savedFiles = files.length > 0
      ? await Promise.all(
          files.map((file) => saveUploadedFile(file, req.nextUrl.pathname)),
        )
      : [];
    const documentPaths = buildDocumentPaths(savedFiles);

    const db = await getDatabase();
    const customersRepository = db.getRepository(Customer);

    const customer = customersRepository.create({
      userId,
      customerType,
      companyName: companyName || undefined,
      displayName,
      currency: currency || "USD",
      address: address || undefined,
      remarks: remarks || undefined,
      documents: documentPaths,
      contacts,
      status: status || "Active",
    });

    await customersRepository.save(customer);

    return NextResponse.json(
      { message: "Customer created successfully", customer },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating customer:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create customer";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 },
    );
  }
};

export default createCustomer;
