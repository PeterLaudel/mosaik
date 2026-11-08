import { Invoice } from "@/features/invoices/model";
import { getInvoicesService } from "@/features/invoices/legacy";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") as Invoice["status"] || undefined;
  const page = Number(searchParams.get("page") ?? 0);
  const pageSize = Number(searchParams.get("pageSize") ?? 25);

  const invoicesService = await getInvoicesService();
  const result = await invoicesService.filter({ search, status, page, pageSize });

  return NextResponse.json(result);
}