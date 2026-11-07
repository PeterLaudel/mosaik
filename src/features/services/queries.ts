import { Service } from "./model";

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
  const url = new URLSearchParams();
  if (query.page !== undefined) url.set("page", String(query.page));
  if (query.pageSize !== undefined) url.set("pageSize", String(query.pageSize));
  const res = await fetch(`/api/services?${url}`);
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
}
