"use server";

import { getPatientsRepository, getSessionsRepository } from "@api/src/server";
import { Session } from "@mosaik/contract/models/session";
import { SessionSave } from "@api/src/repositories/sessionsRepository";

export async function createSession(patientId: number): Promise<Session> {
  const [patientRepository, repo] = await Promise.all([
    getPatientsRepository(),
    getSessionsRepository(),
  ]);
  const patient = await patientRepository.find(patientId);
  const sessionNumber = await repo.nextSessionNumber(patient);
  const previousSession = await repo.findPreviousSession(patientId, sessionNumber);

  return repo.save({
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
    reviewHomework: previousSession?.givenHomework.map((h) => ({
      description: h.description,
      status: "open" as const,
    })) ?? [],
  });
}

export async function updateSession(
  id: number,
  data: Partial<SessionSave>,
): Promise<Session> {
  const repo = await getSessionsRepository();
  const existing = await repo.find(id);
  return repo.save({ ...existing, ...data });
}
