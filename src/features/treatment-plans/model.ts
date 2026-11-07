
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

// A treatment plan only needs to know which patient it belongs to; pages that show patient
// details read them through the patients feature.
export interface TreatmentPlanPatient {
  id: number;
}

export interface TreatmentPlan {
  id: number;
  patient: TreatmentPlanPatient;
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
