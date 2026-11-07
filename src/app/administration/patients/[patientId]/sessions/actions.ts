"use server";

import { getSessionsService } from "@/features/sessions";
import { Session } from "@/features/sessions/model";
import { SessionCreate } from "@/features/sessions/repository";

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
