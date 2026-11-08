"use server";

import { getSessionsService } from "@/features/sessions/legacy";
import { PseudonymizationCheckResult } from "@/features/sessions/service";

export async function getPseudonymizedTextForSessions(
  sessionIds: number[],
): Promise<PseudonymizationCheckResult> {
  const sessionsService = await getSessionsService();
  return sessionsService.getPseudonymizedText(sessionIds);
}
