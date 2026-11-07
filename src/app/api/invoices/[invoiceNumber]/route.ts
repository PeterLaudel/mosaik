import { getInvoicesRepository } from "@/features/invoices";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  const { invoiceNumber } = await params;

  const invoicesRepository = await getInvoicesRepository();
  const invoice = await invoicesRepository.findByInvoiceNumber(invoiceNumber);

  const pdfBuffer = Buffer.from(invoice.base64Pdf, "base64");

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoiceNumber}.pdf"`,
    },
  });
}
