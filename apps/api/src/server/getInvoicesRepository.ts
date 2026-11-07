import { InvoicesRepository } from "../repositories/invoicesRepository";
import { getDb } from "../initialize";

export async function getInvoicesRepository(): Promise<InvoicesRepository> {
  return Promise.resolve(new InvoicesRepository(getDb()));
}
