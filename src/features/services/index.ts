import { getDb } from "@/initialize";
import ServicesRepository from "./repository";
import { ServicesService } from "./service";

export function getServicesService(): Promise<ServicesService> {
  const database = getDb();
  const servicesRepository = new ServicesRepository(database);
  const service = new ServicesService(servicesRepository);
  return Promise.resolve(service);
}
