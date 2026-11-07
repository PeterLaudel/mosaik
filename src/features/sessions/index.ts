import { getDb } from "@/initialize";
import { SessionsRepository } from "./repository";
import { SessionsService } from "./service";

export function getSessionsService(): Promise<SessionsService> {
  return Promise.resolve(new SessionsService(new SessionsRepository(getDb())));
}
