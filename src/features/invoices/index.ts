import { getDb } from "@/initialize";
import { InvoicesRepository } from "./repository";
import { InvoicesService } from "./service";

export function getInvoicesService(): Promise<InvoicesService> {
  const database = getDb();
  const invoicesRepository = new InvoicesRepository(database);
  const service = new InvoicesService(invoicesRepository);
  return Promise.resolve(service);
}
