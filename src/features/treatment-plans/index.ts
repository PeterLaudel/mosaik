import { getDb } from "@/initialize";
import { TreatmentPlansRepository } from "./repository";
import { TreatmentPlansService } from "./service";

export function getTreatmentPlansService(): Promise<TreatmentPlansService> {
  return Promise.resolve(new TreatmentPlansService(new TreatmentPlansRepository(getDb())));
}
