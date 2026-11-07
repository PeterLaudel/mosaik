import { TherapeutRepository } from "../repositories/therapeutRepository";
import { getDb } from "../initialize";

export async function getTherapeutsRepository() {
  return Promise.resolve(new TherapeutRepository(getDb()));
}
