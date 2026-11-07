import { getDb } from "@/initialize";
import { TreatmentPlansRepository } from "./repository";
import { TreatmentPlansService } from "./service";

export function getTreatmentPlansService(): Promise<TreatmentPlansService> {
  const database = getDb();
  const treatmentPlansRepository = new TreatmentPlansRepository(database);
  const service = new TreatmentPlansService(treatmentPlansRepository);
  return Promise.resolve(service);
}
