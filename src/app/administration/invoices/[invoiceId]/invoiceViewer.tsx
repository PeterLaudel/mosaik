"use client";
import { Invoice } from "@/contract";


interface Props {
  invoice: Invoice;
}

export function InvoiceViewer({ invoice }: Props) {
  return (
    <iframe
      className="w-full h-full"
      name="pdf-viewer"
      src={`/api/invoices/by-number/${invoice.invoiceNumber}/pdf`}
    />
  );
}
