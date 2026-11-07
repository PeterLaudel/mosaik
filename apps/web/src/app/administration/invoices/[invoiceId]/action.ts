"use server";

import { InvoiceSave } from "@api/src/repositories/invoicesRepository";
import { getInvoicesRepository } from "@api/src/server";
import { revalidatePath } from "next/cache";

export async function updateInvoice(invoice: InvoiceSave) {
  const invoicesRepository = await getInvoicesRepository();
  const updatedInvoice = await invoicesRepository.save(invoice);

  revalidatePath(`/administration/invoices/${invoice.id}`);

  return updatedInvoice;
}
