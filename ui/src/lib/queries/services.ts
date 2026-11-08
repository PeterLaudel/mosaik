import type { Service } from "@peterlaudel/mosaik-contract";
import { browserApi } from "@/lib/api/client";

export interface ServicesQueryKey {
  page?: number;
  pageSize?: number;
}

export interface ServicesResult {
  rows: Service[];
  total: number;
}

export const servicesQueryKey = (query: ServicesQueryKey = {}) =>
  ["services", query] as const;

export async function fetchServices(query: ServicesQueryKey = {}): Promise<ServicesResult> {
  return browserApi.services.filter(query);
}
