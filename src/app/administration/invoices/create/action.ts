"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api/server";
import { InvoiceCreate } from "@/contract";

export async function createInvoice(invoice: InvoiceCreate) {
  const api = await serverApi();
  const createdInvoice = await api.invoices.create(invoice);

  revalidatePath("/administration/invoice/create");
  return createdInvoice;
}
