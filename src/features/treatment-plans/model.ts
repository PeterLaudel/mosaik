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

export type TreatmentGoal = z.infer<typeof treatmentGoalSchema>;
export type TreatmentPlanPatient = z.infer<typeof treatmentPlanPatientSchema>;
export type TreatmentPlan = z.infer<typeof treatmentPlanSchema>;
export type TreatmentPlanFormData = z.infer<typeof treatmentPlanFormDataSchema>;

export type TreatmentPlanCreate = Omit<TreatmentPlan, "id" | "createdAt">;
export type TreatmentPlanUpdate = TreatmentPlanCreate & { id: number };
