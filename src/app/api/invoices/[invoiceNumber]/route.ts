import { getInvoicesService } from "@/features/invoices";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  const { invoiceNumber } = await params;

  const invoicesService = await getInvoicesService();
  const invoice = await invoicesService.findByInvoiceNumber(invoiceNumber);

  const pdfBuffer = Buffer.from(invoice.base64Pdf, "base64");

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoiceNumber}.pdf"`,
    },
  });
}
