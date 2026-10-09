import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Customer } from "@/entities/Customer";
import { Organization } from "@/entities/Organization";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";
import {
  createMailTransporter,
  getMailFromName,
  getMailFromAddress,
  MissingMailConfigError,
} from "@/lib/mailer";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const orgId = await getAuthOrgId(req);
  if (!orgId) {
    return NextResponse.json(
      { message: "Active organization is required" },
      { status: 400 },
    );
  }

  try {
    const { id } = await params;
    const { to, cc, bcc, subject, message, pdfBase64, filename, balance, currency } =
      await req.json();

    if (!Array.isArray(to) || to.length === 0) {
      return NextResponse.json(
        { message: "At least one recipient is required" },
        { status: 400 },
      );
    }
    if (!pdfBase64 || typeof pdfBase64 !== "string") {
      return NextResponse.json({ message: "Statement PDF is missing" }, { status: 400 });
    }

    const db = await getDatabase();
    const customer = await db
      .getRepository(Customer)
      .findOne({ where: { id: Number(id), organizationId: orgId } as never });
    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }
    const org = await db.getRepository(Organization).findOne({ where: { id: orgId } });

    let transporter;
    try {
      transporter = createMailTransporter();
    } catch (err) {
      if (err instanceof MissingMailConfigError) {
        return NextResponse.json({ message: err.message }, { status: 400 });
      }
      throw err;
    }

    const companyName = getMailFromName(org?.name);
    const customerName =
      (customer as { displayName?: string }).displayName || "Customer";
    const emailSubject = subject?.trim() || `Statement of Account from ${companyName}`;
    const balanceLine = `Balance Due: ${String(currency || "")} ${Number(balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const customMessage =
      typeof message === "string" && message.trim()
        ? message.trim()
        : "Please find your statement of account attached.";
    const formattedMessage = esc(customMessage).replace(/\n/g, "<br/>");

    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Statement of Account</title></head>
<body style="margin:0;padding:20px;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background-color:#2563eb;padding:20px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">Statement of Account</h1>
    </div>
    <div style="padding:40px;font-size:14px;color:#4b5563;line-height:1.8;">
      <div style="margin:0 0 16px;">${formattedMessage}</div>
      <p style="margin:0;font-weight:600;color:#111827;">${esc(balanceLine)}</p>
    </div>
    <div style="padding:20px;border-top:1px solid #e5e7eb;text-align:center;background-color:#f9fafb;">
      <p style="margin:0;font-size:12px;color:#6b7280;">Powered by <span style="color:#f97316;font-weight:600;">Revolutic</span></p>
    </div>
  </div>
</body></html>`;

    await transporter.sendMail({
      from: `"${companyName}" <${getMailFromAddress()}>`,
      replyTo: org?.email || getMailFromAddress(),
      to: to.join(", "),
      ...(cc?.length > 0 && { cc: cc.join(", ") }),
      ...(bcc?.length > 0 && { bcc: bcc.join(", ") }),
      subject: emailSubject,
      text: `Statement of Account\n\n${customMessage}\n\n${balanceLine}\n\nPowered by Revolutic`,
      html,
      attachments: [
        {
          filename: String(filename || "Statement.pdf").replace(/[\\/]/g, "-"),
          content: Buffer.from(pdfBase64, "base64"),
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ message: "Statement sent successfully" });
  } catch (error) {
    console.error("Error sending statement:", error);
    return NextResponse.json({ message: "Failed to send statement" }, { status: 500 });
  }
};
