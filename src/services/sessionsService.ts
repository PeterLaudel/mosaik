import { Session } from "@/models/session";
import { PatientsRepository } from "@/repositories/patientsRepository";
import { SessionCreate, SessionsRepository } from "@/repositories/sessionsRepository";

export type PseudonymizationCheckResult =
  | { status: "pending" }
  | { status: "failed" }
  | { status: "ready"; text: string };

export class SessionsService {
  constructor(
    private readonly patientsRepository: PatientsRepository,
    private readonly sessionsRepository: SessionsRepository,
  ) {}

  async createDraft(patientId: number): Promise<Session> {
    const patient = await this.patientsRepository.find(patientId);
    const sessionNumber = await this.sessionsRepository.nextSessionNumber(patient);
    const previousSession = await this.sessionsRepository.findPreviousSession(
      patientId,
      sessionNumber,
    );

    return this.sessionsRepository.create({
      patient,
      therapeutId: null,
      sessionDate: new Date().toISOString().slice(0, 10),
      sessionNumber,
      durationMinutes: 50,
      sessionType: "Einzelgespräch",
      phase: null,
      moodStart: null,
      moodEnd: null,
      riskLevel: null,
      interventions: [],
      clinicalNotes: null,
      nextSessionPlan: null,
      status: "draft",
      deletedAt: null,
      pseudonymizedNotes: null,
      pseudonymizedNextPlan: null,
      pseudonymizationStatus: null,
      givenHomework: [],
      reviewHomework:
        previousSession?.givenHomework.map((h) => ({
          description: h.description,
          status: "open" as const,
        })) ?? [],
    });
  }

  async update(id: number, data: Partial<SessionCreate>): Promise<Session> {
    const existing = await this.sessionsRepository.find(id);
    return this.sessionsRepository.update({ ...existing, ...data, id });
  }

  async getPseudonymizedText(sessionIds: number[]): Promise<PseudonymizationCheckResult> {
    let sessions = await this.findAll(sessionIds);

    // Safety net: a session can be "final" with no pseudonymization ever queued (e.g. finalized
    // before this feature existed). Without this it would show "pending" forever with nothing
    // in the outbox to resolve it.
    const orphaned = sessions.filter((session) => session.pseudonymizationStatus === null);
    if (orphaned.length > 0) {
      await Promise.all(
        orphaned.map((session) => this.sessionsRepository.enqueuePseudonymizationIfMissing(session)),
      );
      sessions = await this.findAll(sessionIds);
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

  private findAll(sessionIds: number[]): Promise<Session[]> {
    return Promise.all(sessionIds.map((id) => this.sessionsRepository.find(id)));
  }
}
