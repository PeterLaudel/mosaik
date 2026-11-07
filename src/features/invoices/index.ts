import { getDb } from "@/initialize";
import { InvoicesRepository } from "./repository";
import { InvoicesService } from "./service";

export function getInvoicesRepository(): Promise<InvoicesRepository> {
  return Promise.resolve(new InvoicesRepository(getDb()));
}

export async function getInvoicesService(): Promise<InvoicesService> {
  return new InvoicesService(await getInvoicesRepository());
}
