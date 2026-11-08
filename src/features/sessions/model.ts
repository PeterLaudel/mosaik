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

export type SessionPatient = z.infer<typeof sessionPatientSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type SessionCreate = z.infer<typeof sessionCreateSchema>;
export type SessionUpdate = SessionCreate & { id: number };
