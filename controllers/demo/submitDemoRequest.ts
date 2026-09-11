import { NextRequest, NextResponse } from "next/server";
import { DemoRequestPayload, DemoResponseData } from "@/types/demo";

const submitDemoRequest = async (req: NextRequest) => {
  try {
    const body: DemoRequestPayload = await req.json();

    if (!body.fullName || !body.email || !body.company) {
      return NextResponse.json<DemoResponseData>(
        {
          success: false,
          message: "Please fill in all required fields (Full Name, Company, Email).",
        },
        { status: 400 },
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json<DemoResponseData>(
        {
          success: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 },
      );
    }

    // Demo request logged / handled
    console.log("[submitDemoRequest] New demo booking request:", {
      name: body.fullName,
      email: body.email,
      company: body.company,
      phone: body.phoneNumber,
      country: body.country,
      size: body.companySize,
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json<DemoResponseData>(
      {
        success: true,
        message: "Thank you! Your demo request has been submitted successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[submitDemoRequest] Error processing demo request:", error);
    return NextResponse.json<DemoResponseData>(
      {
        success: false,
        message: "Failed to process demo request. Please try again later.",
      },
      { status: 500 },
    );
  }
};

export default submitDemoRequest;
