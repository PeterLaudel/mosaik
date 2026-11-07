import { getDb } from "@/initialize";
import ServicesRepository from "./repository";
import { ServicesService } from "./service";

export function getServicesRepository(): Promise<ServicesRepository> {
  return Promise.resolve(new ServicesRepository(getDb()));
}

export async function getServicesService(): Promise<ServicesService> {
  return new ServicesService(await getServicesRepository());
}
