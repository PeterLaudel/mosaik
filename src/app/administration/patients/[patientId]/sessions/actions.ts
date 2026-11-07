"use server";

import { getSessionsService } from "@/services";
import { Session } from "@/models/session";
import { SessionCreate } from "@/repositories/sessionsRepository";

export async function createSession(patientId: number): Promise<Session> {
  const sessionsService = await getSessionsService();
  return sessionsService.createDraft(patientId);
}

export async function updateSession(
  id: number,
  data: Partial<SessionCreate>,
): Promise<Session> {
  const sessionsService = await getSessionsService();
  return sessionsService.update(id, data);
}
