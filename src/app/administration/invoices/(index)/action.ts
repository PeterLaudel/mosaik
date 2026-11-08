"use server";

import { getInvoicesService } from "@/features/invoices/legacy";
import { MailSender } from "@/features/invoices/mail";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/config";

export async function sendInvoiceEmail(invoiceId: number) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Not authenticated");

  // Until the UI calls the API (stage 1c), the next-auth session supplies the sender
  const email = session.user.email;
  const sender: MailSender =
    session.provider === "google"
      ? { transport: "gmail", email, accessToken: () => Promise.resolve(session.accessToken) }
      : { transport: "json", email };

  const invoicesService = await getInvoicesService();
  await invoicesService.sendByEmail(invoiceId, sender);
  revalidatePath("/administration/invoices");
}

export async function markInvoiceAsPending(invoiceId: number) {
  const invoicesService = await getInvoicesService();
  await invoicesService.updateStatus(invoiceId, "pending");
  revalidatePath("/administration/invoices");
}

export async function markInvoiceAsPaid(invoiceId: number) {
  const invoicesService = await getInvoicesService();
  await invoicesService.updateStatus(invoiceId, "paid");
  revalidatePath("/administration/invoices");
}

export async function markInvoiceAsSent(invoiceId: number) {
  const invoicesService = await getInvoicesService();
  await invoicesService.updateStatus(invoiceId, "sent");
  revalidatePath("/administration/invoices");
}

export async function deleteInvoice(invoiceId: number) {
  const invoicesService = await getInvoicesService();
  await invoicesService.delete(invoiceId);
  revalidatePath("/administration/invoices");
}
