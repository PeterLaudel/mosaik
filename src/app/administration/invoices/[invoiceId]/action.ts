"use server";

import { InvoiceSave } from "@/repositories/invoicesRepository";
import { getInvoicesService } from "@/services";
import { revalidatePath } from "next/cache";

export async function updateInvoice(invoice: InvoiceSave) {
  const invoicesService = await getInvoicesService();
  const updatedInvoice = await invoicesService.save(invoice);

  revalidatePath(`/administration/invoices/${invoice.id}`);

  return updatedInvoice;
}
