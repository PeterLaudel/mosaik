import { getPatientsService } from "@/features/patients";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") ?? 0);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);

  const patientsService = await getPatientsService();
  const result = await patientsService.filter({ search, page, pageSize });

  return NextResponse.json(result);
};
