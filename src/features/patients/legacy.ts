import { getDb } from "@/initialize";
import { PatientsRepository } from "./repository";
import { PatientsService } from "./service";

export function getPatientsService(): Promise<PatientsService> {
  const database = getDb();
  const patientsRepository = new PatientsRepository(database);
  const service = new PatientsService(patientsRepository);
  return Promise.resolve(service);
}
