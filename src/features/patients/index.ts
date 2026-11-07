import { getDb } from "@/initialize";
import { PatientsRepository } from "./repository";
import { PatientsService } from "./service";

export function getPatientsService(): Promise<PatientsService> {
  return Promise.resolve(new PatientsService(new PatientsRepository(getDb())));
}
