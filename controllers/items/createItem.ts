import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Item } from "@/entities/Item";
import { readSession } from "@/lib/session";
import { CreateItemPayload } from "@/types/item";

const createItem = async (req: NextRequest) => {
  const { data } = await readSession(req);
  const userId = data.user?.id;

  try {
    const body: CreateItemPayload = await req.json();
    const { name, unit, description, status } = body;
    const sellingPriceRaw = body.sellingPrice;

    // Mirrors CreateItemDto's class-validator constraints (name/unit
    // required strings, sellingPrice required number >= 0) since there is
    // no ValidationPipe equivalent here — checked sequentially like the
    // customers controller does for its own required fields.
    if (!name || String(name).trim().length === 0) {
      return NextResponse.json(
        { message: "name should not be empty" },
        { status: 400 },
      );
    }
    if (!unit || String(unit).trim().length === 0) {
      return NextResponse.json(
        { message: "unit should not be empty" },
        { status: 400 },
      );
    }
    if (
      sellingPriceRaw === undefined ||
      sellingPriceRaw === null ||
      (sellingPriceRaw as unknown as string) === ""
    ) {
      return NextResponse.json(
        { message: "sellingPrice should not be empty" },
        { status: 400 },
      );
    }
    const sellingPrice = Number(sellingPriceRaw);
    if (Number.isNaN(sellingPrice)) {
      return NextResponse.json(
        {
          message:
            "sellingPrice must be a number conforming to the specified constraints",
        },
        { status: 400 },
      );
    }
    if (sellingPrice < 0) {
      return NextResponse.json(
        { message: "sellingPrice must not be less than 0" },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const itemsRepository = db.getRepository(Item);

    const newItem = itemsRepository.create({
      name,
      unit,
      sellingPrice,
      description,
      userId: parseInt(String(userId)),
      status: status || "Active",
    });

    await itemsRepository.save(newItem);

    return NextResponse.json(
      { message: "Item created successfully", item: newItem },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { message: "Failed to create item" },
      { status: 500 },
    );
  }
};

export default createItem;
