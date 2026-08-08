import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import { Template } from "@/entities/Template";
import { SignupPayload } from "@/types/auth";

const signup = async (req: NextRequest) => {
  try {
    const { name, email, password }: SignupPayload = await req.json();

    const db = await getDatabase();
    const usersRepository = db.getRepository(User);
    const templatesRepository = db.getRepository(Template);

    const userExist = await usersRepository.findOne({ where: { email } });
    if (userExist) {
      return NextResponse.json(
        { message: "This email already exists in the record" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = usersRepository.create({
      name,
      email,
      password: hashedPassword,
    });
    const savedUser = await usersRepository.save(newUser);

    const defaultTemplate = templatesRepository.create({
      userId: savedUser.id,
      templateName: "Standard Template",
      isDefault: true,
      margins: {
        top: 0.7,
        bottom: 0.7,
        left: 0.55,
        right: 0.4,
      },
      fontSize: 8,
      labelFontSize: 8,
    });
    await templatesRepository.save(defaultTemplate);

    const result = { name, email, id: savedUser.id };

    return NextResponse.json(
      { message: "User created successfully", user: result },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error, please try again later" },
      { status: 500 },
    );
  }
};

export default signup;
