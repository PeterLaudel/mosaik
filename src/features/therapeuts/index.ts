import { getDb } from "@/initialize";
import { TherapeutRepository } from "./repository";
import { TherapeutsService } from "./service";

export function getTherapeutsRepository(): Promise<TherapeutRepository> {
  return Promise.resolve(new TherapeutRepository(getDb()));
}

export async function getTherapeutsService(): Promise<TherapeutsService> {
  return new TherapeutsService(await getTherapeutsRepository());
}
