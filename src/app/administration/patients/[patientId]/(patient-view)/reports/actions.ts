"use server";

import { getSessionsService } from "@/services";
import { PseudonymizationCheckResult } from "@/services/sessionsService";

export async function getPseudonymizedTextForSessions(
  sessionIds: number[],
): Promise<PseudonymizationCheckResult> {
  const sessionsService = await getSessionsService();
  return sessionsService.getPseudonymizedText(sessionIds);
}
