import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Payment } from "@/entities/Payment";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";
import { User } from "@/entities/User";
import { loadCustomPlaceholders } from "@/lib/placeholders/server";
import { buildPlaceholderValues } from "@/lib/placeholders/context";
import { replacePlaceholders } from "@/lib/placeholders/replace";
import {
  createMailTransporter,
  getMailFromName,
  getMailFromAddress,
  MissingMailConfigError,
} from "@/lib/mailer";

const sendPayment = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
  const { id } = await params;

  try {
    const body = await req.json();

    const db = await getDatabase();
    const paymentRepo = db.getRepository(Payment);

    const payment = await paymentRepo.findOne({
      where: { id: parseInt(id), organizationId: orgId },
      relations: [
        "customer",
        "organization",
        "template",
        "appliedInvoices",
        "appliedInvoices.invoice",
      ],
    });

    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }

    let transporter;
    try {
      transporter = createMailTransporter();
    } catch (err) {
      if (err instanceof MissingMailConfigError) {
        return NextResponse.json({ message: err.message }, { status: 400 });
      }
      throw err;
    }

    const recipients = Array.isArray(body.to) ? body.to : [body.to];
    const cc = Array.isArray(body.cc) ? body.cc : [];
    const bcc = Array.isArray(body.bcc) ? body.bcc : [];

    const companyName = getMailFromName();
    const sender = await db.getRepository(User).findOne({ where: { id: userId } });
    const values = buildPlaceholderValues({
      scope: "payment",
      payment,
      organization: payment.organization,
      organizationName: companyName,
      sender,
      custom: await loadCustomPlaceholders(orgId),
    });
    const subject = replacePlaceholders(
      body.subject ||
        `Payment Receipt #${payment.paymentNumber || payment.id} - ${companyName}`,
      values,
    );
    const messageHtml = replacePlaceholders(
      body.message || "Thank you for your payment.",
      values,
      { html: true },
    ).replace(/\n/g, "<br/>");

    const mailOptions = {
      from: `"${companyName}" <${getMailFromAddress()}>`,
      to: recipients.join(", "),
      ...(cc.length > 0 && { cc: cc.join(", ") }),
      ...(bcc.length > 0 && { bcc: bcc.join(", ") }),
      subject,
      html: messageHtml,
    };

    await transporter.sendMail(mailOptions);

    payment.status = "Sent";
    await paymentRepo.save(payment);

    return NextResponse.json({
      message: "Payment receipt sent successfully",
      payment,
    });
  } catch (error) {
    console.error("Error sending payment receipt:", error);
    return NextResponse.json(
      { message: "Failed to send payment receipt email" },
      { status: 500 }
    );
  }
};

export default sendPayment;
