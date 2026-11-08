"use server";

import { serverApi } from "@/lib/api/server";
import { PseudonymizationCheckResult } from "@/contract";

export async function getPseudonymizedTextForSessions(
  sessionIds: number[],
): Promise<PseudonymizationCheckResult> {
  const api = await serverApi();
  return api.sessions.getPseudonymizedText({ sessionIds });
}
