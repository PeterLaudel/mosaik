"use server";

import { getSessionsService } from "@/services";
import { Session } from "@/models/session";
import { SessionSave } from "@/repositories/sessionsRepository";

export async function createSession(patientId: number): Promise<Session> {
  const sessionsService = await getSessionsService();
  return sessionsService.createDraft(patientId);
}

export async function updateSession(
  id: number,
  data: Partial<SessionSave>,
): Promise<Session> {
  const sessionsService = await getSessionsService();
  return sessionsService.update(id, data);
}
