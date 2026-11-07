export type SessionType =
  | "Erstgespräch"
  | "Probatorik"
  | "Einzelgespräch"
  | "Telefon"
  | "Gruppentherapie";

export type SessionPhase = "Diagnostik" | "Therapiephase" | "Abschluss";

export type RiskLevel = "none" | "low" | "moderate" | "high";

export type SessionStatus = "draft" | "final";

export type PseudonymizationStatus = "pending" | "done" | "failed";

export const SESSION_TYPES: SessionType[] = [
  "Erstgespräch",
  "Probatorik",
  "Einzelgespräch",
  "Telefon",
  "Gruppentherapie",
];

export const SESSION_PHASES: SessionPhase[] = [
  "Diagnostik",
  "Therapiephase",
  "Abschluss",
];

export const RISK_LEVELS: { value: RiskLevel; label: string }[] = [
  { value: "none", label: "Kein" },
  { value: "low", label: "Niedrig" },
  { value: "moderate", label: "Mittel" },
  { value: "high", label: "Hoch" },
];

export const INTERVENTIONS: string[] = [
  "Kognitive Umstrukturierung",
  "Verhaltensexperiment",
  "Exposition (in sensu / in vivo)",
  "Entspannungsverfahren (PME, Atemübungen)",
  "Schematherapie",
  "EMDR",
  "Aktivitätenaufbau",
  "Problemlösetraining",
  "Psychoedukation",
  "Ressourcenaktivierung",
  "Gesprächsführung / Aktives Zuhören",
];

import { GivenHomework, ReviewHomework } from "./homework";

// Sessions own their view of the patient: just what the session pages show and what
// pseudonymization needs to strip out. It is read from the patients table by this feature's
// selector, not imported from the patients feature.
export interface SessionPatient {
  id: number;
  name: string;
  surname: string;
  birthdate: string;
  address: { street: string; city: string; zip: string };
}

export interface Session {
  id: number;
  therapeutId: number | null;
  sessionDate: string;
  sessionNumber: number;
  durationMinutes: number;
  sessionType: SessionType;
  phase: SessionPhase | null;
  moodStart: number | null;
  moodEnd: number | null;
  riskLevel: RiskLevel | null;
  interventions: string[];
  clinicalNotes: string | null;
  nextSessionPlan: string | null;
  status: SessionStatus;
  deletedAt: string | null;
  createdAt: string;
  patient: SessionPatient;
  givenHomework: GivenHomework[];
  reviewHomework: ReviewHomework[];
  pseudonymizedNotes: string | null;
  pseudonymizedNextPlan: string | null;
  pseudonymizationStatus: PseudonymizationStatus | null;
}

export type SessionCreate = Omit<Session, "id" | "createdAt">;
export type SessionUpdate = SessionCreate & { id: number };
