"use server";

import { revalidatePath } from "next/cache";
import { getInvoicesRepository } from "@api/src/server";
import { InvoiceSave } from "@api/src/repositories/invoicesRepository";

export async function createInvoice(invoiceCreate: InvoiceSave) {
  const invoicesRepository = await getInvoicesRepository();
  const createdInvoice = await invoicesRepository.save(invoiceCreate);

  revalidatePath("/administration/invoice/create");
  return createdInvoice;
}
