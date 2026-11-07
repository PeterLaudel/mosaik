import { TreatmentPlansRepository } from "../repositories/treatmentPlansRepository";
import { getDb } from "../initialize";

export async function getTreatmentPlansRepository() {
  return Promise.resolve(new TreatmentPlansRepository(getDb()));
}
