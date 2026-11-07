import { PatientsRepository } from "../repositories/patientsRepository";
import { getDb } from "../initialize";

export async function getPatientsRepository() {
  return Promise.resolve(new PatientsRepository(getDb()));
}
