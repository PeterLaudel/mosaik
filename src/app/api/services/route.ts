import { getServicesRepository } from "@/features/services";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const page = Number(searchParams.get("page") ?? 0);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);

  const servicesRepository = await getServicesRepository();
  const result = await servicesRepository.filter({ page, pageSize });

  return NextResponse.json(result);
};
