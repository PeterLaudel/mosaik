import type { Patient } from "@peterlaudel/mosaik-contract";
import { browserApi } from "@/lib/api/client";

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
  return browserApi.patients.filter(query);
}
