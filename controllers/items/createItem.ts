import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Item } from "@/entities/Item";
import { User } from "@/entities/User";
import { getAuthUserId } from "@/lib/session";
import { CreateItemPayload } from "@/types/item";

const createItem = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized. Please log in again." },
      { status: 401 },
    );
  }

  try {
    const body: CreateItemPayload = await req.json();
    const { name, unit, description, status } = body;
    const sellingPriceRaw = body.sellingPrice;

    if (!name || String(name).trim().length === 0) {
      return NextResponse.json(
        { message: "Item name should not be empty" },
        { status: 400 },
      );
    }

    const sellingPrice =
      sellingPriceRaw !== undefined && sellingPriceRaw !== null && (sellingPriceRaw as unknown as string) !== ""
        ? Number(sellingPriceRaw)
        : 0;

    if (Number.isNaN(sellingPrice)) {
      return NextResponse.json(
        {
          message:
            "Selling price must be a valid number",
        },
        { status: 400 },
      );
    }
    if (sellingPrice < 0) {
      return NextResponse.json(
        { message: "Selling price must not be less than 0" },
        { status: 400 },
      );
    }

    const db = await getDatabase();

    // Verify user exists in the database to prevent foreign key violations
    const usersRepository = db.getRepository(User);
    const existingUser = await usersRepository.findOne({ where: { id: userId } });
    if (!existingUser) {
      return NextResponse.json(
        { message: "User account not found. Please log out and log in again." },
        { status: 401 },
      );
    }

    const itemsRepository = db.getRepository(Item);

    const newItem = itemsRepository.create({
      name: String(name).trim(),
      unit: unit && String(unit).trim() ? String(unit).trim() : undefined,
      sellingPrice,
      description: description && String(description).trim() ? String(description).trim() : undefined,
      user: existingUser,
      userId: existingUser.id,
      status: status || "Active",
    });

    await itemsRepository.save(newItem);

    return NextResponse.json(
      { message: "Item created successfully", item: newItem },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[createItem] Error creating item:", error);
    const errorMessage =
      error?.detail || error?.message || "Failed to create item";
    return NextResponse.json(
      {
        message: errorMessage,
        error: error?.message || String(error),
        detail: error?.detail || undefined,
      },
      { status: 500 },
    );
  }
};

export default createItem;
