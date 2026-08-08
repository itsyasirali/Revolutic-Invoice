import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Payment } from "@/entities/Payment";
import { getToken } from "next-auth/jwt";
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
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const data = { user: token };
  const userId = data.user?.id;
  const { id } = await params;

  try {
    const parsedUserId = parseInt(String(userId));
    const body = await req.json();

    const db = await getDatabase();
    const paymentRepo = db.getRepository(Payment);

    const payment = await paymentRepo.findOne({
      where: { id: parseInt(id), userId: parsedUserId },
      relations: [
        "customer",
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
    const subject =
      body.subject ||
      `Payment Receipt #${payment.paymentNumber || payment.id} - ${companyName}`;
    const messageHtml = (
      body.message || "Thank you for your payment."
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
