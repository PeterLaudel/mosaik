"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api/server";
import { InvoiceCreate } from "@/contract";

export async function updateInvoice(id: number, invoice: InvoiceCreate) {
  const api = await serverApi();
  const updatedInvoice = await api.invoices.update({ ...invoice, id });

  revalidatePath(`/administration/invoices/${id}`);

  return updatedInvoice;
}
