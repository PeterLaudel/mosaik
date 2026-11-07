"use server";

import { revalidatePath } from "next/cache";
import { getInvoicesService } from "@/services";
import { InvoiceSave } from "@/repositories/invoicesRepository";

export async function createInvoice(invoiceCreate: InvoiceSave) {
  const invoicesService = await getInvoicesService();
  const createdInvoice = await invoicesService.save(invoiceCreate);

  revalidatePath("/administration/invoice/create");
  return createdInvoice;
}
