"use server";

import { getSessionsService } from "@/features/sessions/legacy";
import { Session, SessionCreate } from "@/features/sessions/model";

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
