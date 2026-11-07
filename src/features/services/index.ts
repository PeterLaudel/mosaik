import { getDb } from "@/initialize";
import ServicesRepository from "./repository";
import { ServicesService } from "./service";

export function getServicesService(): Promise<ServicesService> {
  return Promise.resolve(new ServicesService(new ServicesRepository(getDb())));
}
