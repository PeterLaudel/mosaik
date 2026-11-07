import { getDb } from "@/initialize";
import { TherapeutRepository } from "./repository";
import { TherapeutsService } from "./service";

export function getTherapeutsService(): Promise<TherapeutsService> {
  return Promise.resolve(new TherapeutsService(new TherapeutRepository(getDb())));
}
