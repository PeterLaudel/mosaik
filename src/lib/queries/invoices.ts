import type { Invoice } from "@/contract";
import { browserApi } from "@/lib/api/client";

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
  return browserApi.invoices.filter(query);
}
