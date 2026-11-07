"use server";

import { getInvoicesService } from "@/features/invoices";
import { revalidatePath } from "next/cache";

export async function sendInvoiceEmail(invoiceId: number) {
  const invoicesService = await getInvoicesService();
  await invoicesService.sendByEmail(invoiceId);
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
