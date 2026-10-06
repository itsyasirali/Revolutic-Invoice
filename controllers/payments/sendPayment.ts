import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Payment } from "@/entities/Payment";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";
import { User } from "@/entities/User";
import { Template } from "@/entities/Template";
import { generateInvoicePDF } from "@/utils/invoices/generateInvoicePdf";
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

    // Build the payment receipt PDF with the same template overrides the preview uses
    let attachments: Array<{ filename: string; content: Buffer; contentType: string }> = [];
    if (body.attachPDF !== false) {
      const templateRepo = db.getRepository(Template);
      const baseTemplate =
        payment.template ??
        (await templateRepo.findOne({ where: { organizationId: orgId, isDefault: true } })) ??
        (await templateRepo.findOne({ where: { organizationId: orgId } }));
      const num = (n: unknown) =>
        (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const receiptTemplate = {
        ...(baseTemplate ?? {}),
        invoiceLabel: "PAYMENT",
        invoiceDateLabel: "Payment Date",
        termsLabel: "Payment Mode",
        dueDateLabel: "Reference#",
        subtotalLabel: "Amount Received",
        balanceDueLabel: "Total",
        showTotal: false,
        showPreviousDue: false,
        showNotes: false,
        showBankAccount: false,
        tableColumnSettings: [
          { key: "invoiceNumber", label: "Invoice Number", width: 200, align: "left", enabled: true },
          { key: "invoiceAmount", label: "Invoice Amount", width: 150, align: "right", enabled: true },
          { key: "paymentAmount", label: "Payment Amount", width: 150, align: "right", enabled: true },
        ],
      };
      const received = Number(payment.amountReceived) || 0;
      const receipt = {
        invoiceNumber: payment.paymentNumber ? `#${payment.paymentNumber}` : "N/A",
        invoiceDate: payment.paymentDate,
        terms: payment.paymentMode || "N/A",
        dueDate: undefined,
        customer: payment.customer,
        customerDisplayName: payment.customerDisplayName,
        customerAddress: payment.customer?.address || "",
        organization: payment.organization,
        template: receiptTemplate,
        currency: payment.currency || "PKR",
        subTotal: received,
        total: received,
        previousRemaining: 0,
        notes: "",
        items: (payment.appliedInvoices || []).map((a: any) => ({
          invoiceNumber: a.invoice?.invoiceNumber || a.invoiceId || "N/A",
          invoiceAmount: num(a.invoice?.total ?? a.totalAmount),
          paymentAmount: num(a.amount),
        })),
      };
      const pdfBuffer = await generateInvoicePDF(receipt as any, values);
      attachments = [
        {
          filename: `Payment-${payment.paymentNumber || payment.id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ];
    }

    const mailOptions = {
      from: `"${companyName}" <${getMailFromAddress()}>`,
      to: recipients.join(", "),
      ...(cc.length > 0 && { cc: cc.join(", ") }),
      ...(bcc.length > 0 && { bcc: bcc.join(", ") }),
      subject,
      html: messageHtml,
      ...(attachments.length > 0 && { attachments }),
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
