import type { Session } from "@/contract";
import { browserApi } from "@/lib/api/client";

export interface SessionsQueryKey {
  patientId?: number;
  page?: number;
  pageSize?: number;
}

export interface SessionsResult {
  rows: Session[];
  total: number;
}

export const sessionsQueryKey = (query: SessionsQueryKey = {}) =>
  ["sessions", query] as const;

export async function fetchSessions(query: SessionsQueryKey = {}): Promise<SessionsResult> {
  return browserApi.sessions.filter(query);
}
