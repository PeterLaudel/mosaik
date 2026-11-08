"use server";

import { InvoiceCreate } from "@/features/invoices/model";
import { getInvoicesService } from "@/features/invoices/legacy";
import { revalidatePath } from "next/cache";

export async function updateInvoice(id: number, invoice: InvoiceCreate) {
  const invoicesService = await getInvoicesService();
  const updatedInvoice = await invoicesService.update({ ...invoice, id });

  revalidatePath(`/administration/invoices/${id}`);

  return updatedInvoice;
}
