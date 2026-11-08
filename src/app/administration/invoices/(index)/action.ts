"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api/server";

export async function sendInvoiceEmail(invoiceId: number) {
  // The API sends it through the signed-in Google account
  const api = await serverApi();
  await api.invoices.sendByEmail({ id: invoiceId });
  revalidatePath("/administration/invoices");
}

export async function markInvoiceAsPending(invoiceId: number) {
  const api = await serverApi();
  await api.invoices.updateStatus({ id: invoiceId, status: "pending" });
  revalidatePath("/administration/invoices");
}

export async function markInvoiceAsPaid(invoiceId: number) {
  const api = await serverApi();
  await api.invoices.updateStatus({ id: invoiceId, status: "paid" });
  revalidatePath("/administration/invoices");
}

export async function markInvoiceAsSent(invoiceId: number) {
  const api = await serverApi();
  await api.invoices.updateStatus({ id: invoiceId, status: "sent" });
  revalidatePath("/administration/invoices");
}

export async function deleteInvoice(invoiceId: number) {
  const api = await serverApi();
  await api.invoices.delete({ id: invoiceId });
  revalidatePath("/administration/invoices");
}
