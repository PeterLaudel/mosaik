"use server";

import { InvoiceCreate } from "@/repositories/invoicesRepository";
import { getInvoicesService } from "@/services";
import { revalidatePath } from "next/cache";

export async function updateInvoice(id: number, invoice: InvoiceCreate) {
  const invoicesService = await getInvoicesService();
  const updatedInvoice = await invoicesService.update({ ...invoice, id });

  revalidatePath(`/administration/invoices/${id}`);

  return updatedInvoice;
}
