import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Customer } from "@/entities/Customer";
import { readSession } from "@/lib/session";
import { extractFormFields, saveUploadedFile } from "@/lib/upload";
import {
  parseContactsFromBody,
  buildDocumentPaths,
} from "@/utils/customers/customersHelper";

const createCustomer = async (req: NextRequest) => {
  const { data } = await readSession(req);
  const userId = data.user?.id;

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
    const savedFiles = await Promise.all(
      files.map((file) => saveUploadedFile(file, req.nextUrl.pathname)),
    );
    const documentPaths = buildDocumentPaths(savedFiles);

    const db = await getDatabase();
    const customersRepository = db.getRepository(Customer);

    const customer = customersRepository.create({
      userId: parseInt(String(userId)),
      customerType,
      companyName,
      displayName,
      currency,
      address,
      remarks,
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
    return NextResponse.json(
      { message: "Failed to create customer" },
      { status: 500 },
    );
  }
};

export default createCustomer;
