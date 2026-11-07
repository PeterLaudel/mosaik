import { Patient } from "./model";

export interface PatientsQueryKey {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PatientsResult {
  rows: Patient[];
  total: number;
}

export const patientsQueryKey = (query: PatientsQueryKey = {}) =>
  ["patients", query] as const;

export async function fetchPatients(query: PatientsQueryKey = {}): Promise<PatientsResult> {
  const url = new URLSearchParams();
  if (query.search) url.set("search", query.search);
  if (query.page !== undefined) url.set("page", String(query.page));
  if (query.pageSize !== undefined) url.set("pageSize", String(query.pageSize));
  const res = await fetch(`/api/patients?${url}`);
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
}
