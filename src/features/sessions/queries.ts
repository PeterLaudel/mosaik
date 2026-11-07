import { Session } from "./model";

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
  const url = new URLSearchParams();
  if (query.patientId !== undefined) url.set("patientId", String(query.patientId));
  if (query.page !== undefined) url.set("page", String(query.page));
  if (query.pageSize !== undefined) url.set("pageSize", String(query.pageSize));
  const res = await fetch(`/api/sessions?${url}`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}
