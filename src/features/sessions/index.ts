import { getDb } from "@/initialize";
import { SessionsRepository } from "./repository";
import { SessionsService } from "./service";

export function getSessionsRepository(): Promise<SessionsRepository> {
  return Promise.resolve(new SessionsRepository(getDb()));
}

export async function getSessionsService(): Promise<SessionsService> {
  return new SessionsService(await getSessionsRepository());
}
