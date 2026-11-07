"use server";

import { revalidatePath } from "next/cache";
import { getInvoicesService } from "@/services";
import { InvoiceCreate } from "@/repositories/invoicesRepository";

export async function createInvoice(invoice: InvoiceCreate) {
  const invoicesService = await getInvoicesService();
  const createdInvoice = await invoicesService.create(invoice);

  revalidatePath("/administration/invoice/create");
  return createdInvoice;
}
