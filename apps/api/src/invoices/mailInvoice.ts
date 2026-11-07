import { Invoice } from "@mosaik/contract/models/invoice";
import { Therapeut } from "@mosaik/contract/models/therapeut";
import * as nodemailer from "nodemailer";
import { environment, googleClientId, googleClientSecret } from "../environment";
import type { Session } from "../auth/sessionToken";
import { lastEmail } from "../testing/lastEmail";

export default async function mailInvoice(
  session: Session | undefined,
  therapeut: Therapeut,
  invoice: Invoice,
): Promise<void> {
  const transporter = await createTransport(session);
  const info = await transporter.sendMail({
    from: `${therapeut.name} ${therapeut.surname} <${therapeut.email}>`,
    to: `${invoice.patient.name} ${invoice.patient.surname} <${invoice.patient.billingInfo.email}>`,
    subject: `Ihre Rechnung ${invoice.invoiceNumber}`,
    text: `Sehr geehrte/r ${invoice.patient.name} ${invoice.patient.surname},\n\nanbei erhalten Sie Ihre Rechnung ${invoice.invoiceNumber}.\n\nMit freundlichen Grüßen\n${therapeut.name} ${therapeut.surname}`,
    attachments: [
      {
        filename: `Rechnung_${invoice.invoiceNumber}.pdf`,
        content: Buffer.from(invoice.base64Pdf, "base64"),
        contentType: "application/pdf",
      },
    ],
  });

  if (transporter.transporter.name === "JSONTransport") {
    lastEmail.set(JSON.stringify(info));
  }
}

async function createTransport(session: Session | undefined) {
  if (environment() === "test") {
    const account = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
  }

  if (!session) {
    throw new Error("Not authenticated");
  }

  if (session.provider === "google") {
    if (!session.refreshToken) throw new Error("Google session has no refresh token, please sign in again");
    // nodemailer exchanges the refresh token for a fresh access token itself
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: session.email,
        clientId: googleClientId(),
        clientSecret: googleClientSecret(),
        refreshToken: session.refreshToken,
      },
    });
  }

  if (session.provider === "test_provider") {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  throw new Error("Unknown provider");
}
