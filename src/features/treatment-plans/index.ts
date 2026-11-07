import { getDb } from "@/initialize";
import { TreatmentPlansRepository } from "./repository";
import { TreatmentPlansService } from "./service";

export function getTreatmentPlansRepository(): Promise<TreatmentPlansRepository> {
  return Promise.resolve(new TreatmentPlansRepository(getDb()));
}

export async function getTreatmentPlansService(): Promise<TreatmentPlansService> {
  return new TreatmentPlansService(await getTreatmentPlansRepository());
}
