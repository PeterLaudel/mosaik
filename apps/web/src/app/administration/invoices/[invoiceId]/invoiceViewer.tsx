"use client";

import { Invoice } from "@mosaik/contract/models/invoice";

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
