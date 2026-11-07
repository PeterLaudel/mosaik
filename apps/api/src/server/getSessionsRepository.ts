import { SessionsRepository } from "../repositories/sessionsRepository";
import { getDb } from "../initialize";

export async function getSessionsRepository() {
  return Promise.resolve(new SessionsRepository(getDb()));
}
