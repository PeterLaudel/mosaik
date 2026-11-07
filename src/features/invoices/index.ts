import { getDb } from "@/initialize";
import { InvoicesRepository } from "./repository";
import { InvoicesService } from "./service";

export function getInvoicesService(): Promise<InvoicesService> {
  return Promise.resolve(new InvoicesService(new InvoicesRepository(getDb())));
}
