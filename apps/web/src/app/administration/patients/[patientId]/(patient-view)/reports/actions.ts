"use server";

import { getSessionsRepository } from "@api/src/server";

export type PseudonymizationCheckResult =
  | { status: "pending" }
  | { status: "failed" }
  | { status: "ready"; text: string };

export async function getPseudonymizedTextForSessions(
  sessionIds: number[],
): Promise<PseudonymizationCheckResult> {
  const sessionsRepository = await getSessionsRepository();
  let sessions = await Promise.all(sessionIds.map((id) => sessionsRepository.find(id)));

  // Safety net: a session can be "final" with no pseudonymization ever queued (e.g. finalized
  // before this feature existed). Without this it would show "pending" forever with nothing
  // in the outbox to resolve it.
  const orphaned = sessions.filter((session) => session.pseudonymizationStatus === null);
  if (orphaned.length > 0) {
    await Promise.all(
      orphaned.map((session) => sessionsRepository.enqueuePseudonymizationIfMissing(session)),
    );
    sessions = await Promise.all(sessionIds.map((id) => sessionsRepository.find(id)));
  }

  if (sessions.some((session) => session.pseudonymizationStatus === "failed")) {
    return { status: "failed" };
  }
  if (sessions.some((session) => session.pseudonymizationStatus !== "done")) {
    return { status: "pending" };
  }

  const text = sessions
    .map((session) =>
      [session.pseudonymizedNotes, session.pseudonymizedNextPlan].filter(Boolean).join("\n\n"),
    )
    .filter(Boolean)
    .join("\n\n---\n\n");

  return { status: "ready", text };
}
