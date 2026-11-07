import ServicesRepository from "../repositories/servicesRepository";
import { getDb } from "../initialize";

export async function getServicesRepository(): Promise<ServicesRepository> {
  return Promise.resolve(new ServicesRepository(getDb()));
}
