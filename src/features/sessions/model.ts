import { z } from "zod";
import {
  pseudonymizationStatusSchema,
  riskLevelSchema,
  sessionCreateSchema,
  sessionPatientSchema,
  sessionPhaseSchema,
  sessionSchema,
  sessionStatusSchema,
  sessionTypeSchema,
} from "./contract";

export type SessionType = z.infer<typeof sessionTypeSchema>;
export type SessionPhase = z.infer<typeof sessionPhaseSchema>;
export type RiskLevel = z.infer<typeof riskLevelSchema>;
export type SessionStatus = z.infer<typeof sessionStatusSchema>;
export type PseudonymizationStatus = z.infer<typeof pseudonymizationStatusSchema>;

export const SESSION_TYPES: SessionType[] = sessionTypeSchema.options;

export const SESSION_PHASES: SessionPhase[] = sessionPhaseSchema.options;

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

export type SessionPatient = z.infer<typeof sessionPatientSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type SessionCreate = z.infer<typeof sessionCreateSchema>;
export type SessionUpdate = SessionCreate & { id: number };
