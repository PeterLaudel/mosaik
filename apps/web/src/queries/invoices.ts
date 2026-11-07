import { Invoice } from "@mosaik/contract/models/invoice";

export interface InvoicesQueryKey {
  search?: string;
  status?: Invoice["status"];
  page?: number;
  pageSize?: number;
}

export interface InvoicesResult {
  rows: Invoice[];
  total: number;
}

export function invoicesQueryKey(query: InvoicesQueryKey) {
  return ["invoices", query];
}

export async function fetchInvoices(query: InvoicesQueryKey): Promise<InvoicesResult> {
  const url = new URLSearchParams();
  if (query.search) url.set("search", query.search);
  if (query.status) url.set("status", query.status);
  if (query.page !== undefined) url.set("page", String(query.page));
  if (query.pageSize !== undefined) url.set("pageSize", String(query.pageSize));
  const res = await fetch(`/api/invoices?${url}`);
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
}
