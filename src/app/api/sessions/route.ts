import { getSessionsService } from "@/features/sessions";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const patientId = searchParams.get("patientId");
  const page = Number(searchParams.get("page") ?? 0);
  const pageSize = Number(searchParams.get("pageSize") ?? 50);

  const sessionsService = await getSessionsService();
  const result = await sessionsService.filter({
    patientId: patientId ? Number(patientId) : undefined,
    page,
    pageSize,
  });

  return NextResponse.json(result);
};

