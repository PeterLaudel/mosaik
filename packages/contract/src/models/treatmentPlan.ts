import { Patient } from "./patient";

export type TherapyForm =
  | "Einzeltherapie"
  | "Gruppentherapie"
  | "Probatorik";

export type TreatmentPhase =
  | "Diagnostik"
  | "Therapiephase"
  | "Abschluss";

export type GoalStatus = "active" | "achieved" | "abandoned";

export const THERAPY_FORMS: TherapyForm[] = [
  "Einzeltherapie",
  "Gruppentherapie",
  "Probatorik",
];

export const TREATMENT_PHASES: TreatmentPhase[] = [
  "Diagnostik",
  "Therapiephase",
  "Abschluss",
];

export const GOAL_STATUSES: { value: GoalStatus; label: string }[] = [
  { value: "active", label: "Aktiv" },
  { value: "achieved", label: "Erreicht" },
  { value: "abandoned", label: "Aufgegeben" },
];

export interface TreatmentGoal {
  description: string;
  status: GoalStatus;
  priority: number;
}

export interface TreatmentPlan {
  id: number;
  patient: Patient;
  therapeutId: number | null;
  startDate: string;
  endDate: string | null;
  therapyForm: TherapyForm;
  phase: TreatmentPhase;
  approvedSessions: number | null;
  notes: string | null;
  createdAt: string;
  goals: TreatmentGoal[];
}
