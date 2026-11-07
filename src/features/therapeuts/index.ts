import { getDb } from "@/initialize";
import { TherapeutRepository } from "./repository";
import { TherapeutsService } from "./service";

export function getTherapeutsService(): Promise<TherapeutsService> {
  const database = getDb();
  const therapeutRepository = new TherapeutRepository(database);
  const service = new TherapeutsService(therapeutRepository);
  return Promise.resolve(service);
}
