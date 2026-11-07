import { getDb } from "@/initialize";
import { PatientsRepository } from "./repository";
import { PatientsService } from "./service";

export function getPatientsRepository(): Promise<PatientsRepository> {
  return Promise.resolve(new PatientsRepository(getDb()));
}

export async function getPatientsService(): Promise<PatientsService> {
  return new PatientsService(await getPatientsRepository());
}
