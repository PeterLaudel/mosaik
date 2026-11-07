"use client";

import { Invoice } from "@/features/invoices/model";

interface Props {
  invoice: Invoice;
}

export function InvoiceViewer({ invoice }: Props) {
  return (
    <iframe
      className="w-full h-full"
      name="pdf-viewer"
      src={`/api/invoices/${invoice.invoiceNumber}`}
    />
  );
}
