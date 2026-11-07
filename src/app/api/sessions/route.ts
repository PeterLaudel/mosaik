import { getSessionsRepository } from "@/features/sessions";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const patientId = searchParams.get("patientId");
  const page = Number(searchParams.get("page") ?? 0);
  const pageSize = Number(searchParams.get("pageSize") ?? 50);

  const sessionsRepository = await getSessionsRepository();
  const result = await sessionsRepository.filter({
    patientId: patientId ? Number(patientId) : undefined,
    page,
    pageSize,
  });

  return NextResponse.json(result);
};

