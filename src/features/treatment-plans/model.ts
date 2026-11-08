import { z } from "zod";
import {
  goalStatusSchema,
  therapyFormSchema,
  treatmentGoalSchema,
  treatmentPhaseSchema,
  treatmentPlanFormDataSchema,
  treatmentPlanPatientSchema,
  treatmentPlanSchema,
} from "./contract";

export type TherapyForm = z.infer<typeof therapyFormSchema>;
export type TreatmentPhase = z.infer<typeof treatmentPhaseSchema>;
export type GoalStatus = z.infer<typeof goalStatusSchema>;

export const THERAPY_FORMS: TherapyForm[] = therapyFormSchema.options;
export const TREATMENT_PHASES: TreatmentPhase[] = treatmentPhaseSchema.options;

export const GOAL_STATUSES: { value: GoalStatus; label: string }[] = [
  { value: "active", label: "Aktiv" },
  { value: "achieved", label: "Erreicht" },
  { value: "abandoned", label: "Aufgegeben" },
];

export type TreatmentGoal = z.infer<typeof treatmentGoalSchema>;
export type TreatmentPlanPatient = z.infer<typeof treatmentPlanPatientSchema>;
export type TreatmentPlan = z.infer<typeof treatmentPlanSchema>;
export type TreatmentPlanFormData = z.infer<typeof treatmentPlanFormDataSchema>;

export type TreatmentPlanCreate = Omit<TreatmentPlan, "id" | "createdAt">;
export type TreatmentPlanUpdate = TreatmentPlanCreate & { id: number };
