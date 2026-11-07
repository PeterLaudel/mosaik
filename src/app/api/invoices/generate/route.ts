import { NextRequest } from "next/server";
import { CreatePdfParams, generateInvoiceBlob } from "@/features/invoices/pdf";

export async function POST(request: NextRequest) {
  const data = (await request.json()) as CreatePdfParams;

  const newBuffer = await generateInvoiceBlob(data);
  return new Response(newBuffer, {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
