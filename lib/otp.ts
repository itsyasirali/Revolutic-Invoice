import crypto from "crypto";
import {
  createMailTransporter,
  getMailFromName,
  getMailFromAddress,
  MissingMailConfigError,
} from "@/lib/mailer";

export const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const hashOtp = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

export const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

export const sendOtpEmail = async (
  email: string,
  otp: string,
  opts?: { subject?: string; intro?: string },
) => {
  try {
    const transporter = createMailTransporter();
    await transporter.sendMail({
      from: `"${getMailFromName()}" <${getMailFromAddress()}>`,
      to: email,
      subject: opts?.subject || "Your verification code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <p>${opts?.intro || "Your verification code is:"}</p>
          <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${otp}</p>
          <p>This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (mailError) {
    if (mailError instanceof MissingMailConfigError) {
      console.error("OTP email not sent:", mailError.message);
    } else {
      console.error("Failed to send OTP email:", mailError);
    }
    throw mailError;
  }
};
