"use server";

import { serverApi } from "@/lib/api/server";
import { Session, SessionCreate } from "@/contract";

export async function createSession(patientId: number): Promise<Session> {
  const api = await serverApi();
  return api.sessions.createDraft({ patientId });
}

export async function updateSession(
  id: number,
  data: Partial<SessionCreate>,
): Promise<Session> {
  const api = await serverApi();
  return api.sessions.update({ ...data, id });
}
