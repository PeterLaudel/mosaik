"use server";

import { serverApi } from "@/lib/api/server";
import { PseudonymizationCheckResult } from "@peterlaudel/mosaik-contract";

export async function getPseudonymizedTextForSessions(
  sessionIds: number[],
): Promise<PseudonymizationCheckResult> {
  const api = await serverApi();
  return api.sessions.getPseudonymizedText({ sessionIds });
}
