import { getDb } from "@/initialize";
import { SessionsRepository } from "./repository";
import { SessionsService } from "./service";

export function getSessionsService(): Promise<SessionsService> {
  const database = getDb();
  const sessionsRepository = new SessionsRepository(database);
  const service = new SessionsService(sessionsRepository);
  return Promise.resolve(service);
}
